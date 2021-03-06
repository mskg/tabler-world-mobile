import { BatchWrite, WriteRequest } from '@mskg/tabler-world-aws';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ISubscription } from '../../types/ISubscription';
import { ISubscriptionStorage, SubscriptionDetails } from '../../types/ISubscriptionStorage';
import { FieldNames } from './FieldNames';

const logger = new ConsoleLogger('dynamodb');

function makeKey(connectionId: string, subscriptionId: string, trigger: string) {
    return `${connectionId}:${subscriptionId}:${trigger}`;
}

export class DynamoDBSubcriptionStorage implements ISubscriptionStorage {
    constructor(private tableName: string, private client: DocumentClient) {
    }

    public async hasSubscribers(triggers: string[]) {
        const members = await Promise.all(
            triggers.map((t) => this.list(t, true)),
        );

        return members.map(
            (v, i) => v.length > 0 ? triggers[i] : undefined,
        ).filter(Boolean) as string[];
    }

    public async list(trigger: string, test = false): Promise<ISubscription<any>[]> {
        logger.debug('getSubscriptions', trigger);

        const { Items: clients } = await this.client.query({
            TableName: this.tableName,
            IndexName: 'reverse',

            KeyConditionExpression: `${FieldNames.eventName} = :trigger`,
            ExpressionAttributeValues: {
                ':trigger': trigger,
            },

            Limit: test ? 1 : undefined,
            ProjectionExpression: `${FieldNames.subscription}, ${FieldNames.principal}, ${FieldNames.payload}, ${FieldNames.context}`,
        }).promise();

        return clients
            ? clients.map((c) => {
                const [connectionId, subscriptionId] = c[FieldNames.subscription].split(':');

                return ({
                    subscriptionId,
                    payload: c[FieldNames.payload],
                    connection: {
                        connectionId,
                        principal: c[FieldNames.principal],
                        context: c[FieldNames.context],
                    },
                });
            })
            : [];
    }

    public async put(triggers: string[], detail: SubscriptionDetails, ttl: number): Promise<void> {
        logger.debug(`[${detail.connection.connectionId}] [${detail.subscriptionId}]`, 'subscribe', triggers, detail.payload);

        const items: [string, WriteRequest][] = triggers.map((trigger) => ([
            this.tableName,
            {
                PutRequest: {
                    Item: {
                        [FieldNames.subscription]: makeKey(detail.connection.connectionId, detail.subscriptionId, trigger),
                        [FieldNames.connectionId]: detail.connection.connectionId,
                        [FieldNames.eventName]: trigger,

                        // Authentication
                        [FieldNames.principal]: detail.connection.principal,

                        // GraphQL subscription
                        [FieldNames.payload]: detail.payload,

                        // Metadata
                        [FieldNames.context]: detail.connection.context,

                        ttl: Math.floor(Date.now() / 1000) + ttl,
                    },
                },
            }]),
        );

        for await (const item of new BatchWrite(this.client, items)) {
            logger.debug('Wrote', item[0], item[1].PutRequest?.Item[FieldNames.subscription]);
        }
    }

    public async remove(connectionId: string, subscriptionId?: string): Promise<void> {
        logger.debug(`[${connectionId}] [${subscriptionId}]`, 'remove');

        if (subscriptionId) { await this.unsubcribe(connectionId, subscriptionId); }
        else { await this.unsubscribeAll(connectionId); }
    }

    async unsubcribe(connectionId: string, subscriptionId?: string): Promise<void> {
        const { Items: subscriptions } = await this.client.query({
            TableName: this.tableName,
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
            this.tableName,
            {
                DeleteRequest: {
                    Key: {
                        [FieldNames.subscription]: t[FieldNames.subscription],
                    },
                },
            },
        ]));

        for await (const item of new BatchWrite(this.client, items)) {
            logger.debug('Removed', item[0], item[1].DeleteRequest?.Key[FieldNames.subscription]);
        }
    }

    async unsubscribeAll(connectionId: string): Promise<void> {
        const { Items: subscriptions } = await this.client.query({
            ExpressionAttributeValues: {
                ':connection': connectionId,
            },
            IndexName: 'connection',
            KeyConditionExpression: `${FieldNames.connectionId} = :connection`,
            ProjectionExpression: `${FieldNames.subscription}`,
            TableName: this.tableName,
        }).promise();

        if (!subscriptions || subscriptions.length === 0) { return; }

        const items: [string, WriteRequest][] = subscriptions.map((t) => ([
            this.tableName,
            {
                DeleteRequest: {
                    Key: {
                        [FieldNames.subscription]: t[FieldNames.subscription],
                    },
                },
            },
        ]));

        for await (const item of new BatchWrite(this.client, items)) {
            logger.debug('Removed', item[0], item[1].DeleteRequest?.Key[FieldNames.subscription]);
        }
    }
}
