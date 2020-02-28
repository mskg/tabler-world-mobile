import { BatchWrite, EXECUTING_OFFLINE, WriteRequest } from '@mskg/tabler-world-aws';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { PushNotificationBase } from '@mskg/tabler-world-push-client';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ulid } from 'ulid';
import { handler as publish } from '../../publishMessageLambda';
import { EncodedWebsocketEvent } from '../types/EncodedWebsocketEvent';
import { WebsocketEvent } from '../types/WebsocketEvent';
import { EVENTS_TABLE, FieldNames } from './Constants';
import { EncryptionManager } from './EncryptionManager';

type PaggedResponse<T> = {
    result: T[]
    nextKey?: DocumentClient.Key,
};

type QueryOptions = {
    forward: boolean,
    pageSize: number,
    token?: DocumentClient.Key,
};

type WebsocketMessage<T> = {
    sender?: number,
    triggers: string[],
    payload: T,

    pushNotification?: {
        sender?: number,
        message: PushNotificationBase<T>,
    },

    encrypted: boolean,
    volatile?: boolean,
    trackDelivery?: boolean,

    ttl?: number,
};

const EMPTY_RESULT = { result: [] };

const logger = new ConsoleLogger('ws:event');
// const ulid = monotonicFactory();

export class WebsocketEventManager {
    constructor(private client: DocumentClient) { }

    public async unMarshall<T>(message: EncodedWebsocketEvent): Promise<WebsocketEvent<T>> {
        if (message.plain) {
            return this.unMarshallUnecrypted(message);
        }

        const em = new EncryptionManager(message.eventName);
        return this.unMarshallWithEncryptionManager<T>(em, message);
    }

    public async events<T = any>(trigger: string, options: QueryOptions = { forward: false, pageSize: 10 }): Promise<PaggedResponse<WebsocketEvent<T>>> {
        logger.log('event', trigger);
        const em = new EncryptionManager(trigger);

        const { Items: messages, LastEvaluatedKey: nextKey, ConsumedCapacity } = await this.client.query({
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

        // @ts-ignore
        return messages
            ? {
                nextKey,
                result: await Promise.all(
                    messages.map((m) => {
                        if (m.plain) { return this.unMarshallUnecrypted(m as EncodedWebsocketEvent); }
                        return this.unMarshallWithEncryptionManager(em, m as EncodedWebsocketEvent);
                    }),
                ),
            }
            : EMPTY_RESULT;
    }

    public async markDelivered({ eventName, id }: WebsocketEvent<any>) {
        logger.log('markDelivered', id);

        await this.client.update({
            TableName: EVENTS_TABLE,

            Key: {
                [FieldNames.trigger]: eventName,
                [FieldNames.id]: id,
            },

            UpdateExpression: 'set delivered = :s',
            ExpressionAttributeValues: {
                ':s': true,
            },
        }).promise();
    }

    public async post<T = any>(
        { triggers, payload, pushNotification, ttl, sender, trackDelivery = true, encrypted, volatile = false }: WebsocketMessage<T>,
    ): Promise<WebsocketEvent<T>[]> {
        logger.log('postMessage', triggers, payload);

        const baseMessage = {
            trackDelivery,
            payload,
            volatile,
            sender,
            timestamp: Date.now(),

            // we have to invert the condition to be compatible
            // with old messages
            plain: !encrypted,

            pushNotification: pushNotification ? pushNotification.message : undefined,
            delivered: false,
        } as WebsocketEvent<T>;

        const messages = await Promise.all(triggers.map(async (t) => {
            const sendPayload = {
                // need a full copy
                ...JSON.parse(JSON.stringify(baseMessage)),
                id: ulid(),
                eventName: t,
            };

            let transportMessage;
            if (encrypted) {
                const em = new EncryptionManager(t);
                transportMessage = await this.marshallEncrypted<T>(em, sendPayload);
            } else {
                transportMessage = this.marshallUnencrypted<T>(sendPayload);
            }

            // we don't care about the little drift
            if (ttl) {
                // @ts-ignore
                transportMessage.ttl = Math.floor(Date.now() / 1000) + ttl;
            }

            return transportMessage;
        }));

        // dynamodb streams are not working offline so invoke lambda directly
        if (EXECUTING_OFFLINE) {
            setTimeout(
                () => publish({
                    // @ts-ignore
                    Records: messages.map((message) => ({
                        eventName: 'INSERT',
                        dynamodb: {
                            NewImage: message,
                        },
                    })),
                }),
                1000,
            );
        }

        const items: [string, WriteRequest][] = messages.map((message) => ([
            EVENTS_TABLE,
            {
                PutRequest: {
                    Item: message,
                },
            },
        ]));

        for await (const item of new BatchWrite(this.client, items)) {
            logger.log('Updated', item[0], item[1].PutRequest?.Item[FieldNames.id]);
        }

        return messages.map((m) => ({
            ...baseMessage,
            id: m.id,
            eventName: m.eventName,
        }));
    }

    public async remove(eventName: string, ids: string[]): Promise<void> {
        logger.log('remove', ids);

        const items: [string, WriteRequest][] = ids.map((id) => ([
            EVENTS_TABLE,
            {
                DeleteRequest: {
                    Key: {
                        [FieldNames.trigger]: eventName,
                        [FieldNames.id]: id,
                    },
                },
            },
        ]));

        for await (const item of new BatchWrite(this.client, items)) {
            logger.log('Removed', item[0], item[1].DeleteRequest?.Key[FieldNames.id]);
        }
    }

    private async marshallEncrypted<T>(em: EncryptionManager, message: WebsocketEvent<T>): Promise<EncodedWebsocketEvent> {
        return {
            id: message.id,
            eventName: message.eventName,

            sender: message.sender,

            payload: await em.encrypt(message.payload),
            pushNotification: message.pushNotification
                ? await em.encrypt(message.pushNotification)
                : undefined,

            delivered: message.delivered,
            trackDelivery: message.trackDelivery,

            volatile: message.volatile,
            plain: message.plain,

            timestamp: message.timestamp,
        };
    }

    private marshallUnencrypted<T>(message: WebsocketEvent<T>): EncodedWebsocketEvent {
        return {
            id: message.id,
            eventName: message.eventName,

            sender: message.sender,

            payload: message.payload,
            pushNotification: message.pushNotification,

            delivered: message.delivered,
            trackDelivery: message.trackDelivery,

            volatile: message.volatile,
            plain: message.plain,

            timestamp: message.timestamp,
        };
    }

    private unMarshallUnecrypted<T>(message: EncodedWebsocketEvent): WebsocketEvent<T> {
        return {
            id: message.id,
            eventName: message.eventName,
            sender: message.sender,

            payload: message.payload,
            pushNotification: message.pushNotification,

            plain: message.plain,
            volatile: message.volatile,

            delivered: message.delivered,
            trackDelivery: message.trackDelivery,

            timestamp: message.timestamp,
        };
    }

    private async unMarshallWithEncryptionManager<T>(em: EncryptionManager, message: EncodedWebsocketEvent): Promise<WebsocketEvent<T>> {
        return {
            id: message.id,
            eventName: message.eventName,
            sender: message.sender,

            payload: await em.decrypt<T>(message.payload),
            pushNotification: message.pushNotification
                ? await em.decrypt(message.pushNotification)
                : undefined,

            delivered: message.delivered,
            trackDelivery: message.trackDelivery,

            plain: message.plain,
            volatile: message.volatile,

            timestamp: message.timestamp,
        };
    }
}
