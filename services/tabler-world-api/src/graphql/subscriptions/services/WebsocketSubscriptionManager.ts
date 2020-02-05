import { BatchWrite, WriteRequest } from '@mskg/tabler-world-aws';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import { ISubscriptionContext } from '../../types/ISubscriptionContext';
import { dynamodb as client } from '../aws/dynamodb';
import { ClientLostError } from '../types/ClientLostError';
import { IConnectionContext } from '../types/IConnection';
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

            ProjectionExpression: `${FieldNames.subscription}, ${FieldNames.principal}, ${FieldNames.payload}, ${FieldNames.context}`,
        }).promise();

        return clients
            ? clients.map((c) => {
                const [connectionId, subscriptionId] = c[FieldNames.subscription].split(':');

                return ({
                    subscriptionId,
                    connection: {
                        connectionId,
                        memberId: c[FieldNames.principal].id,
                        payload: c[FieldNames.payload],
                        principal: c[FieldNames.principal],
                        context: c[FieldNames.context],
                    },
                } as ISubscription);
            })
            : [];
    }

    public async subscribe(context: ISubscriptionContext, subscriptionId: string, triggers: string[], payload: any): Promise<void> {
        logger.log(`[${context.connectionId}] [${subscriptionId}]`, 'subscribe', triggers, payload);

        const params = await getWebsocketParams();

        const items: [string, WriteRequest][] = triggers.map((trigger) => ([
            SUBSCRIPTIONS_TABLE,
            {
                PutRequest: {
                    Item: {
                        [FieldNames.subscription]: makeKey(context.connectionId, subscriptionId, trigger),
                        [FieldNames.connectionId]: context.connectionId,
                        [FieldNames.trigger]: trigger,

                        // Authentication
                        [FieldNames.principal]: context.principal,

                        // GraphQL subscription
                        [FieldNames.payload]: payload,

                        // Metadata
                        [FieldNames.context]: context.clientInfo as IConnectionContext,

                        ttl: Math.floor(Date.now() / 1000) + params.ttlSubscription,
                    },
                },
            }]),
        );

        for await (const item of new BatchWrite(client, items)) {
            logger.log('Wrote', item[0], item[1].PutRequest?.Item[FieldNames.subscription]);
        }
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

        const items: [string, WriteRequest][] = subscriptions.map((t) => ([
            SUBSCRIPTIONS_TABLE,
            {
                DeleteRequest: {
                    Key: {
                        [FieldNames.subscription]: t[FieldNames.subscription],
                    },
                },
            },
        ]));

        for await (const item of new BatchWrite(client, items)) {
            logger.log('Removed', item[0], item[1].DeleteRequest?.Key[FieldNames.subscription]);
        }
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

        const items: [string, WriteRequest][] = subscriptions.map((t) => ([
            SUBSCRIPTIONS_TABLE,
            {
                DeleteRequest: {
                    Key: {
                        [FieldNames.subscription]: t[FieldNames.subscription],
                    },
                },
            },
        ]));

        for await (const item of new BatchWrite(client, items)) {
            logger.log('Removed', item[0], item[1].DeleteRequest?.Key[FieldNames.subscription]);
        }
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
