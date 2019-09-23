import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { DocumentClient, Key } from 'aws-sdk/clients/dynamodb';
import uuid from 'uuid';
import { handler as publish } from '../../publishMessageLambda';
import { WebSocketLogger } from '../utils/WebSocketLogger';
import { CHANNELS_TABLE, EVENTS_TABLE, FieldNames } from './Constants';
import client from './dynamodb';

export type ChannelMessage = {
    channel: string,
    id: string,
    payload: ChannelMessagePayload,
};

export type EncodedChannelMessage = {
    channel: string,
    id: string,
    payload: string,
};

export type ChannelMessagePayload = {
    payload?: any,
    createdAt: number,
    type: 'text' | 'join' | 'leave',
    sender: number,
};

const logger = new WebSocketLogger('SubscriptionManager');

type PaggedResponse<T> = {
    result: T[]
    nextKey?: DocumentClient.Key,
};

const EMPTY_RESULT = { result: [] };

export class ChannelManager {
    public async getMessages(channel: string, key?: DocumentClient.Key): Promise<PaggedResponse<ChannelMessage>> {
        logger.log(`[${channel}]`, 'messages');

        const { Items: messages, LastEvaluatedKey: nextKey, ConsumedCapacity } = await client.query({
            TableName: EVENTS_TABLE,
            ExclusiveStartKey: key,
            Limit: 50,

            KeyConditionExpression: `${FieldNames.channel} = :channel`,
            ExpressionAttributeValues: {
                ':channel': channel,
            },
            // new message go on top,
            ScanIndexForward: true,
        }).promise();

        logger.log(`[${channel}]`, 'messages', ConsumedCapacity);

        return messages
            ? { nextKey, result: messages.map((m) => this.unMarshall(m as EncodedChannelMessage)) }
            : EMPTY_RESULT;
    }

    public async getChannels(member: number, key?: Key): Promise<PaggedResponse<string>> {
        logger.log('getChannels', member);

        const { Items: channels, LastEvaluatedKey: nextKey, ConsumedCapacity } = await client.query({
            TableName: CHANNELS_TABLE,
            ExclusiveStartKey: key,
            Limit: 50,

            KeyConditionExpression: `${FieldNames.member} = :member`,
            ExpressionAttributeValues: {
                ':member': member,
            },
            IndexName: 'reverse',

            ProjectionExpression: `${FieldNames.channel}`,
            // newest channels on top
            ScanIndexForward: true,
        }).promise();

        logger.log('getChannels', member, ConsumedCapacity);

        return channels
            ? { nextKey, result: channels.map((m) => m[FieldNames.channel]) as string[] }
            : EMPTY_RESULT;
    }


    public async subscribe(channel: string, member: number[]) {
        logger.log(`[${channel}]`, 'subscribe', channel, member);

        return client.batchWrite({
            RequestItems: {
                [CHANNELS_TABLE]: member.map((m) => ({
                    PutRequest: {
                        Item: {
                            [FieldNames.channel]: channel,
                            [FieldNames.member]: m,
                        },
                    },
                })),
            },
        }).promise();
    }

    public async unsubscribe(channel: string, member: number[]) {
        logger.log(`[${channel}]`, 'unsubscribe', member);

        return client.batchWrite({
            RequestItems: {
                [CHANNELS_TABLE]: member.map((m) => ({
                    DeleteRequest: {
                        Key: {
                            [FieldNames.channel]: channel,
                            [FieldNames.member]: m,
                        },
                    },
                })),
            },
        }).promise();
    }

    public async getSubscribers(channel: string): Promise<number[] | undefined> {
        logger.log(`[${channel}]`, 'getSubscribers');

        const { Items: members, ConsumedCapacity } = await client.query({
            TableName: CHANNELS_TABLE,

            ExpressionAttributeValues: {
                ':channel': channel,
            },
            KeyConditionExpression: `${FieldNames.channel} = :channel`,
            ProjectionExpression: `${FieldNames.member}`,
        }).promise();

        logger.log(`[${channel}]`, 'getSubscribers', ConsumedCapacity);
        return members ? members.map((m) => m[FieldNames.member] as number) : [];
    }

    public marshall(message: ChannelMessage): EncodedChannelMessage {
        return {
            ...message,
            payload: JSON.stringify(message.payload),
        };
    }

    public unMarshall(message: EncodedChannelMessage): ChannelMessage {
        return {
            ...message,
            payload: JSON.parse(message.payload),
        };
    }

    public async postMessage(channel: string, payload: ChannelMessagePayload): Promise<ChannelMessage> {
        logger.log(`[${channel}]`, 'postMessage', payload);

        const channelMessage = {
            channel,
            payload,
            id: uuid.v4(),
        };

        const message = this.marshall(channelMessage);

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

        await client.put({
            Item: {
                ...message,
                // two days
                ttl: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2,
            },
            TableName: EVENTS_TABLE,
        }).promise();

        return channelMessage;
    }
}
