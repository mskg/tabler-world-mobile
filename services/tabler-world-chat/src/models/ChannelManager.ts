import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import uuid from 'uuid';
import client from '../aws/dynamodb';
import { handler as publish } from '../publish';
import { CHANNELS_TABLE, EVENTS_TABLE, FieldNames } from '../utils/tables';

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

export class ChannelManager {
    public async subscribe(channel: string, member: number) {
        console.log('[subscribe]', channel, member);

        return client.put({
            TableName: CHANNELS_TABLE,
            Item: {
                [FieldNames.channel]: channel,
                [FieldNames.member]: member,
            },
        }).promise();
    }

    public async unsubscribe(channel: string, member: number) {
        console.log('[unsubscribe]', channel, member);

        return client.delete({
            TableName: CHANNELS_TABLE,
            Key: {
                [FieldNames.channel]: channel,
                [FieldNames.member]: member,
            },
        }).promise();
    }

    public async getSubscribers(channel: string): Promise<number[] | undefined> {
        const { Items: members } = await client.query({
            ExpressionAttributeValues: {
                ':channel': channel,
            },
            KeyConditionExpression: `${FieldNames.channel} = :channel`,
            ProjectionExpression: `${FieldNames.member}`,
            TableName: CHANNELS_TABLE,
        }).promise();

        return members ? members.map((m) => m[FieldNames.member] as number) : [];
    }

    public async postMessage(channel: string, data: ChannelMessageRoot): Promise<ChannelMessage> {
        console.log('[post]', channel, data);

        const payload: ChannelMessage = {
            ...data,
            channel,
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
