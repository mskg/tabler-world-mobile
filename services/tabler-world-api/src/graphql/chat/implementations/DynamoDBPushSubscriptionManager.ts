import { BatchWrite, EXECUTING_OFFLINE, WriteRequest } from '@mskg/tabler-world-aws';
import { cachedDataLoader, makeCacheKey } from '@mskg/tabler-world-cache';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { IPushSubscriptionManager, PushSubscriber, WebsocketEvent } from '@mskg/tabler-world-lambda-subscriptions';
import { PushNotification, PushNotificationService } from '@mskg/tabler-world-push-client';
import { useDatabase } from '@mskg/tabler-world-rds-client';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { cacheInstance } from '../../cache/cacheInstance';
import { isChatMuted } from '../../dataSources/ConversationsDataSource';
import { DIRECT_CHAT_PREFIX, FieldNames, PUSH_SUBSCRIPTIONS_TABLE } from '../Constants';
import { PartialPushNotification } from '../types/WebsocketMessage';

const logger = new ConsoleLogger('push');
const pushClient = new PushNotificationService();

export class DynamoDBPushSubscriptionManager implements IPushSubscriptionManager {
    constructor(private client: DocumentClient) { }

    public async send(event: WebsocketEvent<any, PartialPushNotification>, members: PushSubscriber[]): Promise<void> {
        if (!event.pushNotification) { return; }

        const messages: PushNotification<any>[] = members.map((m) => {
            // send a silent push notification and just change the badge
            if (m.muted) {
                return {
                    ...event.pushNotification!,
                    member: m.id,

                    body: '',
                    title: '',
                    subtitle: '',

                    options: {
                        badge: 1,
                        sound: null,
                    },
                };
            }

            // active with all details
            return {
                ...event.pushNotification!,
                member: m.id,
                payload: {
                    ...event.payload,
                    eventId: event.id,
                },

                options: {
                    ...event.pushNotification!.options || { sound: 'default' },
                    badge: 1,
                },
            };
        });

        if (EXECUTING_OFFLINE) {
            logger.debug('sendingPush', messages);
            return;
        }

        await pushClient.send(messages);
    }

    public async subscribe(conversation: string, member: number[]): Promise<void> {
        logger.log(`[${conversation}]`, 'subscribe', conversation, member);

        // this is a one:one conversation, you cannot unsuscribe
        if (conversation.startsWith(DIRECT_CHAT_PREFIX)) {
            return;
        }

        const items: [string, WriteRequest][] = member.map((m) => ([
            PUSH_SUBSCRIPTIONS_TABLE,
            {
                PutRequest: {
                    Item: {
                        [FieldNames.conversation]: conversation,
                        [FieldNames.member]: m,
                    },
                },
            },
        ]));

        for await (const item of new BatchWrite(this.client, items)) {
            logger.log('Updated', item[0], item[1].PutRequest?.Item[FieldNames.member]);
        }
    }

    public async unsubscribe(conversation: string, member: number[]): Promise<void> {
        logger.log(`[${conversation}]`, 'unsubscribe', member);

        // this is a one:one conversation, you cannot unsubscribe
        if (conversation.startsWith(DIRECT_CHAT_PREFIX)) {
            return;
        }

        const items: [string, WriteRequest][] = member.map((m) => ([
            PUSH_SUBSCRIPTIONS_TABLE,
            {
                DeleteRequest: {
                    Key: {
                        [FieldNames.conversation]: conversation,
                        [FieldNames.member]: m,
                    },
                },
            },
        ]));

        for await (const item of new BatchWrite(this.client, items)) {
            logger.log('Deleted', item[0], item[1].DeleteRequest?.Key[FieldNames.member]);
        }
    }

    isChatMuted(members: number[]): Promise<boolean[]> {
        const loader = cachedDataLoader<number>(
            {
                logger,
                cache: cacheInstance,
            },
            (k) => makeCacheKey('Member', ['chat', 'muted', k]),
            // tslint:disable-next-line: variable-name
            (_r, id) => makeCacheKey('Member', ['chat', 'muted', id]),
            (ids) => useDatabase(
                { logger },
                async (client) => isChatMuted(client, ids),
            ),
            'ChatEnabled',
        );

        return loader(members);
    }

    public async getSubscribers(conversation: string): Promise<PushSubscriber[]> {
        logger.debug(`[${conversation}]`, 'getSubscribers');

        let members: number[] = [];

        // this is a one:one conversation
        if (conversation.startsWith(DIRECT_CHAT_PREFIX)) {
            const [a, b] = conversation
                .replace(/CONV\(|\)|:/ig, '')
                .split(',');

            members = [parseInt(a, 10), parseInt(b, 10)];
        } else {
            const { Items } = await this.client.query({
                TableName: PUSH_SUBSCRIPTIONS_TABLE,

                ExpressionAttributeValues: {
                    ':conversation': conversation,
                },
                KeyConditionExpression: `${FieldNames.conversation} = :conversation`,
                ProjectionExpression: `${FieldNames.member}`,
            }).promise();

            if (Items) {
                members = Items.map((m) => m[FieldNames.member] as number);
            }
        }

        if (!members || members.length === 0) { return []; }
        const muted = await this.isChatMuted(members);

        return members
            .map((m, i) => ({
                id: m,
                muted: muted[i],
            }))
            .filter((m) => m.id !== 0); // this is the standard id
    }
}
