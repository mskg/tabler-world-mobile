import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { monotonicFactory } from 'ulid';
import { handler as publish } from '../../publishMessageLambda';
import { dynamodb as client } from '../aws/dynamodb';
import { WebsocketLogger } from '../utils/WebsocketLogger';
import { EVENTS_TABLE, FieldNames } from './Constants';

export type WebsocketEvent<T> = {
    trigger: string,
    id: string,
    payload: T,
};

export type EncodedWebsocketEvent = {
    eventName: string,
    id: string,
    payload: string,
};

type PaggedResponse<T> = {
    result: T[]
    nextKey?: DocumentClient.Key,
};

const EMPTY_RESULT = { result: [] };

const logger = new WebsocketLogger('Event');
const ulid = monotonicFactory();

export class WebsocketEventManager {
    public marshall<T>(message: WebsocketEvent<T>): EncodedWebsocketEvent {
        return {
            id: message.id,
            eventName: message.trigger,
            payload: JSON.stringify(message.payload),
        };
    }

    public unMarshall<T>(message: EncodedWebsocketEvent): WebsocketEvent<T> {
        return {
            id: message.id,
            trigger: message.eventName,
            payload: JSON.parse(message.payload),
        };
    }

    public async events<T = any>(trigger: string, key?: DocumentClient.Key, pageSize: number = 10): Promise<PaggedResponse<WebsocketEvent<T>>> {
        logger.log('event', trigger);

        const { Items: messages, LastEvaluatedKey: nextKey, ConsumedCapacity } = await client.query({
            TableName: EVENTS_TABLE,
            ExclusiveStartKey: key,
            Limit: pageSize,

            KeyConditionExpression: `${FieldNames.trigger} = :trigger`,
            ExpressionAttributeValues: {
                ':trigger': trigger,
            },
            // new message go on top,
            ScanIndexForward: false,
        }).promise();

        logger.log('event', trigger, 'consumed', ConsumedCapacity);

        return messages
            ? { nextKey, result: messages.map((m) => this.unMarshall(m as EncodedWebsocketEvent)) }
            : EMPTY_RESULT;
    }


    public async post<T = any>(trigger: string, payload: T, ttl?: number): Promise<WebsocketEvent<T>> {
        logger.log('postMessage', trigger, payload);

        const rawMessage = {
            trigger,
            payload,
            id: ulid(),
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
