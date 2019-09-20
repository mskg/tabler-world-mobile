import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import uuid from 'uuid';
import client from '../aws/dynamodb';
import { handler as publish } from '../publish';
import { CHANNELS_TABLE, CONNECTIONS_TABLE, EVENTS_TABLE, FieldNames } from '../utils/tables';
import { Connection } from './Connection';

type Subscriber = {
    connectionId: string;
    subscriptionId: string;
};

export type ChannelMessage = {
    channel: string,
    id: string,
} & ChannelMessageRoot;

export type ChannelMessageRoot = {
    payload?: any,
    createdAt: Date,
    type: 'text' | 'join' | 'leave',
    sender: number,
};

export class Channel {
    constructor(private channel: string) {
    }

    public async subscribe(member: number) {
        console.log('[subscribe]', this.channel, member);

        return client.put({
            TableName: CHANNELS_TABLE,
            Item: {
                [FieldNames.channel]: this.channel,
                [FieldNames.member]: member,
            },
        }).promise();
    }

    public async unsubscribe(member: number) {
        console.log('[unsubscribe]', this.channel, member);

        return client.delete({
            TableName: CHANNELS_TABLE,
            Key: {
                [FieldNames.channel]: this.channel,
                [FieldNames.member]: member,
            },
        }).promise();
    }

    public async getSubscribers(): Promise<Subscriber[] | undefined> {
        const { Items: members } = await client.query({
            ExpressionAttributeValues: {
                ':channel': this.channel,
            },
            KeyConditionExpression: `${FieldNames.channel} = :channel`,
            ProjectionExpression: `${FieldNames.member}`,
            TableName: CHANNELS_TABLE,
        }).promise();

        const subscribers: Subscriber[] = [];

        for (const member of (members || [])) {
            const { Items: clients } = await client.query({
                ExpressionAttributeValues: {
                    ':member': member[FieldNames.member],
                },
                IndexName: 'reverse',
                KeyConditionExpression: `${FieldNames.member} = :member`,
                ProjectionExpression: `${FieldNames.connectionId}, ${FieldNames.subscriptionId}`,
                TableName: CONNECTIONS_TABLE,
            }).promise();

            // @ts-ignore
            subscribers.push(... (clients || []));
        }

        return subscribers;
    }

    public async publishMessage(data: any) {
        const subscribers = await this.getSubscribers();
        if (!subscribers) return;

        const promises = subscribers.map(async ({ connectionId, subscriptionId }) => {
            const connection = new Connection(connectionId);

            try {
                await connection.sendMessage({
                    id: subscriptionId,
                    payload: { data },
                    type: MessageTypes.GQL_DATA,
                });
            } catch (err) {
                console.error(err);
                if (err.statusCode === 410) {	// this client has disconnected unsubscribe it
                    connection.unsubscribe();
                }
            }
        });

        await Promise.all(promises);
    }

    public async postMessage(data: ChannelMessageRoot): Promise<ChannelMessage> {
        console.log('[post]', this.channel, data);

        const payload: ChannelMessage = {
            ...data,
            channel: this.channel,
            id: uuid.v4(),
        };

        if (EXECUTING_OFFLINE) { // dynamodb streams are not working offline so invoke lambda directly
            await publish({
                Records: [{
                    eventName: 'INSERT' as 'INSERT',
                    // @ts-ignore
                    dynamodb: {
                        NewImage: payload,
                    },
                }],
            });
        }

        await client.put({
            Item: {
                ...payload,
                // two days
                ttl: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2,
            },
            TableName: EVENTS_TABLE,
        }).promise();

        return payload;
    }
}
