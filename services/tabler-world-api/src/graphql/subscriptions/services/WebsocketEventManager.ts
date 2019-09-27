import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { PushNotificationBase } from '@mskg/tabler-world-push-client';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { monotonicFactory } from 'ulid';
import { handler as publish } from '../../publishMessageLambda';
import { dynamodb as client } from '../aws/dynamodb';
import { EncodedWebsocketEvent } from '../types/EncodedWebsocketEvent';
import { WebsocketEvent } from '../types/WebsocketEvent';
import { EVENTS_TABLE, FieldNames } from './Constants';

type PaggedResponse<T> = {
    result: T[]
    nextKey?: DocumentClient.Key,
};

type QueryOptions = {
    forward: boolean,
    pageSize: number,
    token?: DocumentClient.Key,
};

const EMPTY_RESULT = { result: [] };

const logger = new ConsoleLogger('Event');
const ulid = monotonicFactory();

export class WebsocketEventManager {
    public marshall<T>(message: WebsocketEvent<T>): EncodedWebsocketEvent {
        return {
            id: message.id,
            eventName: message.trigger,
            sender: message.sender,
            payload: JSON.stringify(message.payload),
            pushNotification: message.pushNotification ? JSON.stringify(message.pushNotification) : undefined,
        };
    }

    public unMarshall<T>(message: EncodedWebsocketEvent): WebsocketEvent<T> {
        return {
            id: message.id,
            trigger: message.eventName,
            sender: message.sender,
            payload: JSON.parse(message.payload),
            pushNotification: message.pushNotification ? JSON.parse(message.pushNotification) : undefined,
        };
    }

    public async events<T = any>(trigger: string, options: QueryOptions = { forward: false, pageSize: 10 }): Promise<PaggedResponse<WebsocketEvent<T>>> {
        logger.log('event', trigger);

        const { Items: messages, LastEvaluatedKey: nextKey, ConsumedCapacity } = await client.query({
            TableName: EVENTS_TABLE,
            ExclusiveStartKey: options.token,
            Limit: options.pageSize,

            KeyConditionExpression: `${FieldNames.trigger} = :trigger`,
            ExpressionAttributeValues: {
                ':trigger': trigger,
            },
            // new message go on top,
            ScanIndexForward: options.forward,
        }).promise();

        logger.log('event', trigger, 'consumed', ConsumedCapacity);

        return messages
            ? { nextKey, result: messages.map((m) => this.unMarshall(m as EncodedWebsocketEvent)) }
            : EMPTY_RESULT;
    }


    public async post<T = any>(trigger: string, payload: T, push?: { sender?: number, message: PushNotificationBase<T> }, ttl?: number): Promise<WebsocketEvent<T>> {
        logger.log('postMessage', trigger, payload);

        const rawMessage = {
            trigger,
            payload,
            id: ulid(),
            pushNotification: push ? push.message : undefined,
            sender: push ? push.sender : undefined,
        } as WebsocketEvent<T>;

        const message = this.marshall<T>(rawMessage);

        // dynamodb streams are not working offline so invoke lambda directly
        if (EXECUTING_OFFLINE) {
            await publish({
                Records: [{
                    eventName: 'INSERT' as 'INSERT',
                    // @ts-ignore
                    dynamodb: {
                        NewImage: message,
                    },
                }],
            });
        }

        if (ttl) {
            // @ts-ignore
            message.ttl = Math.floor(Date.now() / 1000) + ttl;
        }

        await client.put({
            Item: {
                ...message,
            },
            TableName: EVENTS_TABLE,
        }).promise();

        return rawMessage;
    }
}
