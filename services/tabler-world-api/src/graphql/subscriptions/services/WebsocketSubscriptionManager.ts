import { IPrincipal } from '@mskg/tabler-world-auth-client';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import { dynamodb as client } from '../aws/dynamodb';
import { ISubscription } from '../types/ISubscription';
import { getWebsocketParams } from '../utils/getWebsocketParams';
import { FieldNames, SUBSCRIPTIONS_TABLE } from './Constants';
import { WebsocketConnectionManager } from './WebsocketConnectionManager';

const logger = new ConsoleLogger('Subscription');

function makeKey(connectionId: string, subscriptionId: string, trigger: string) {
    return `${connectionId}:${subscriptionId}:${trigger}`;
}

export class WebsocketSubscriptionManager {
    constructor(private connection: WebsocketConnectionManager) {
    }

    public async getSubscriptions(trigger: string): Promise<ISubscription[]> {
        logger.log('getSubscriptions', trigger);

        const { Items: clients } = await client.query({
            TableName: SUBSCRIPTIONS_TABLE,
            IndexName: 'reverse',

            KeyConditionExpression: `${FieldNames.trigger} = :trigger`,
            ExpressionAttributeValues: {
                ':trigger': trigger,
            },

            ProjectionExpression: `${FieldNames.subscription}, ${FieldNames.principal}, ${FieldNames.payload}`,
        }).promise();

        return clients
            ? clients.map((c) => {
                const [connectionId, subscriptionId] = c[FieldNames.subscription].split(':');

                return ({
                    subscriptionId,
                    connection: {
                        connectionId,
                        payload: c[FieldNames.payload],
                        principal: c[FieldNames.principal],
                    },
                } as ISubscription);
            })
            : [];
    }

    public async subscribe(connectionId: string, subscriptionId: string, triggers: string[], principal: IPrincipal, payload: any): Promise<void> {
        logger.log(`[${connectionId}] [${subscriptionId}]`, 'subscribe', triggers, payload);

        const params = await getWebsocketParams();
        await client.batchWrite({
            RequestItems: {
                [SUBSCRIPTIONS_TABLE]: triggers.map((trigger) => ({
                    PutRequest: {
                        Item: {
                            [FieldNames.subscription]: makeKey(connectionId, subscriptionId, trigger),
                            [FieldNames.connectionId]: connectionId,
                            [FieldNames.trigger]: trigger,

                            // Authentication
                            [FieldNames.principal]: principal,

                            // GraphQL subscritption
                            [FieldNames.payload]: payload,

                            ttl: Math.floor(Date.now() / 1000) + params.ttlSubscription,
                        },
                    },
                })),
            },
        }).promise();
    }

    public async unsubscribe(connectionId: string, subscriptionId: string): Promise<void> {
        logger.log(`[${connectionId}] [${subscriptionId}]`, 'unsubscribe');

        const { Items: subscriptions } = await client.query({
            TableName: SUBSCRIPTIONS_TABLE,
            IndexName: 'connection',

            KeyConditionExpression: `${FieldNames.connectionId} = :connection and begins_with(subscription, :subscription)`,
            ExpressionAttributeValues: {
                ':connection': connectionId,
                ':subscription': `${connectionId}:${subscriptionId}:`,
            },

            ProjectionExpression: `${FieldNames.subscription}`,
        }).promise();

        if (!subscriptions || subscriptions.length === 0) { return; }

        await client.batchWrite({
            RequestItems: {
                [SUBSCRIPTIONS_TABLE]: subscriptions.map((t) => ({
                    DeleteRequest: {
                        Key: {
                            [FieldNames.subscription]: t[FieldNames.subscription],
                        },
                    },
                })),
            },
        }).promise();
    }

    public async unsubscribeAll(connectionId: string): Promise<void> {
        logger.log(`[${connectionId}]`, 'unsubscribeAll');

        const { Items: subscriptions } = await client.query({
            ExpressionAttributeValues: {
                ':connection': connectionId,
            },
            IndexName: 'connection',
            KeyConditionExpression: `${FieldNames.connectionId} = :connection`,
            ProjectionExpression: `${FieldNames.subscription}`,
            TableName: SUBSCRIPTIONS_TABLE,
        }).promise();

        if (!subscriptions || subscriptions.length === 0) { return; }

        await client.batchWrite({
            RequestItems: {
                [SUBSCRIPTIONS_TABLE]: subscriptions.map((t) => ({
                    DeleteRequest: {
                        Key: {
                            [FieldNames.subscription]: t[FieldNames.subscription],
                        },
                    },
                })),
            },
        }).promise();
    }

    public async sendData(connectionId: string, subscriptionId: string, payload: any): Promise<void> {
        try {
            await this.connection.sendMessage(
                connectionId,
                {
                    payload,
                    id: subscriptionId,
                    type: MessageTypes.GQL_DATA,
                },
            );
        } catch (err) {
            // connection does no longeer exist
            if (err instanceof ClientLostError) {
                await this.unsubscribeAll(connectionId);
            }

            throw err;
        }
    }
}
