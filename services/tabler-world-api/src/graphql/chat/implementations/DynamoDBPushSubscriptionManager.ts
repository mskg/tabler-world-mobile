import { BatchWrite, EXECUTING_OFFLINE, WriteRequest } from '@mskg/tabler-world-aws';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { IPushSubscriptionManager, PushSubscriber, WebsocketEvent } from '@mskg/tabler-world-lambda-subscriptions';
import { PushNotification, PushNotificationService } from '@mskg/tabler-world-push-client';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { DIRECT_CHAT_PREFIX, FieldNames, PUSH_SUBSCRIPTIONS_TABLE } from '../Constants';
import { PartialPushNotification } from '../types/WebsocketMessage';

const logger = new ConsoleLogger('push');
const pushClient = new PushNotificationService();

export class DynamoDBPushSubscriptionManager implements IPushSubscriptionManager {
    constructor(private client: DocumentClient) { }

    public async send(event: WebsocketEvent<any, PartialPushNotification>, members: number[]): Promise<void> {
        if (!event.pushNotification) { return; }

        const messages: PushNotification<any>[] = members.map((m) => {
            return {
                ...event.pushNotification!,
                member: m,
                payload: {
                    ...event.payload,
                    eventId: event.id,
                },
            };
        });

        if (EXECUTING_OFFLINE) {
            logger.debug('sendingPush', messages);
            return;
        }

        await pushClient.send(messages.map((m) => ({
            ...m,
            options: {
                ...m.options || { sound: 'default' },
                badge: 1,
            },
        })));
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

    public async getSubscribers(conversation: string): Promise<PushSubscriber[]> {
        logger.debug(`[${conversation}]`, 'getSubscribers');

        // this is a one:one conversation
        if (conversation.startsWith(DIRECT_CHAT_PREFIX)) {
            const [a, b] = conversation
                .replace(/CONV\(|\)|:/ig, '')
                .split(',');

            return [
                { id: parseInt(a, 10), muted: false },
                { id: parseInt(b, 10), muted: false },
            ];
        }

        const { Items: members } = await this.client.query({
            TableName: PUSH_SUBSCRIPTIONS_TABLE,

            ExpressionAttributeValues: {
                ':conversation': conversation,
            },
            KeyConditionExpression: `${FieldNames.conversation} = :conversation`,
            ProjectionExpression: `${FieldNames.member}`,
        }).promise();

        return members
            ? members
                .map((m) => ({
                    id: m[FieldNames.member] as number,
                    muted: false,
                }))
                .filter((m) => m.id !== 0)
            : [];
    }
}
