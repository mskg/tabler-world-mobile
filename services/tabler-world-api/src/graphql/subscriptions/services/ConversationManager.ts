import { ConsoleLogger } from '@mskg/tabler-world-common';
import { DocumentClient, Key } from 'aws-sdk/clients/dynamodb';
import { dynamodb as client } from '../aws/dynamodb';
import { CONVERSATIONS_TABLE, FieldNames } from './Constants';

const logger = new ConsoleLogger('Conversation');

type PaggedResponse<T> = {
    result: T[]
    nextKey?: DocumentClient.Key,
};

const EMPTY_RESULT = { result: [] };

export class ConversationManager {
    public async getConversations(member: number, key?: Key): Promise<PaggedResponse<string>> {
        logger.log('getConversations', member);

        const { Items: channels, LastEvaluatedKey: nextKey, ConsumedCapacity } = await client.query({
            TableName: CONVERSATIONS_TABLE,
            ExclusiveStartKey: key,
            Limit: 10,

            KeyConditionExpression: `${FieldNames.member} = :member`,
            ExpressionAttributeValues: {
                ':member': member,
            },
            IndexName: 'reverse',

            ProjectionExpression: `${FieldNames.conversation}`,
            // newest channels on top
            ScanIndexForward: true,
        }).promise();

        logger.log('getChannels', member, ConsumedCapacity);

        return channels
            ? { nextKey, result: channels.map((m) => m[FieldNames.conversation]) as string[] }
            : EMPTY_RESULT;
    }

    public async conversation(conversation: string): Promise<any> {
        logger.log(`[${conversation}]`, 'get');

        const { Item } = await client.get({
            TableName: CONVERSATIONS_TABLE,

            Key: {
                [FieldNames.conversation]: conversation,
                [FieldNames.member]: 0,
            },
        }).promise();

        return Item;
    }

    public async update(conversation: string, lastKey: string): Promise<void> {
        logger.log(`[${conversation}]`, 'update', lastKey);

        await client.update({
            TableName: CONVERSATIONS_TABLE,

            Key: {
                [FieldNames.conversation]: conversation,
                [FieldNames.member]: 0,
            },

            UpdateExpression: `set ${FieldNames.lastMessage} = :s`,
            ExpressionAttributeValues: {
                ':s': lastKey,
            },
        }).promise();
    }

    public async removeMembers(conversation: string, member: number[]): Promise<void> {
        logger.log(`[${conversation}]`, 'removeMembers', member);

        await client.update({
            TableName: CONVERSATIONS_TABLE,

            Key: {
                [FieldNames.conversation]: conversation,
                [FieldNames.member]: 0,
            },

            UpdateExpression: `DELETE ${FieldNames.members} :m`,
            ExpressionAttributeValues: {
                ':m': client.createSet(member),
            },
        }).promise();
    }

    public async addMembers(conversation: string, s: number[]): Promise<void> {
        logger.log(`[${conversation}]`, 'addMembers', s);

        await client.update({
            TableName: CONVERSATIONS_TABLE,

            Key: {
                [FieldNames.conversation]: conversation,
                [FieldNames.member]: 0,
            },

            UpdateExpression: `ADD ${FieldNames.members} :m`,
            ExpressionAttributeValues: {
                ':m': client.createSet(s),
            },
        }).promise();
    }

    public async subscribe(conversation: string, member: number[]): Promise<void> {
        logger.log(`[${conversation}]`, 'subscribe', conversation, member);

        await client.batchWrite({
            RequestItems: {
                [CONVERSATIONS_TABLE]: member.map((m) => ({
                    PutRequest: {
                        Item: {
                            [FieldNames.conversation]: conversation,
                            [FieldNames.member]: m,
                        },
                    },
                })),
            },
        }).promise();

        await this.addMembers(conversation, member);
    }

    public async unsubscribe(conversation: string, member: number[]): Promise<void> {
        logger.log(`[${conversation}]`, 'unsubscribe', member);

        await client.batchWrite({
            RequestItems: {
                [CONVERSATIONS_TABLE]: member.map((m) => ({
                    DeleteRequest: {
                        Key: {
                            [FieldNames.conversation]: conversation,
                            [FieldNames.member]: m,
                        },
                    },
                })),
            },
        }).promise();

        await this.removeMembers(conversation, member);
    }

    public async getSubscribers(conversation: string): Promise<number[] | undefined> {
        logger.log(`[${conversation}]`, 'getSubscribers');

        const { Items: members, ConsumedCapacity } = await client.query({
            TableName: CONVERSATIONS_TABLE,

            ExpressionAttributeValues: {
                ':conversation': conversation,
            },
            KeyConditionExpression: `${FieldNames.conversation} = :conversation`,
            ProjectionExpression: `${FieldNames.member}`,
        }).promise();

        logger.log(`[${conversation}]`, 'getSubscribers', ConsumedCapacity);
        return members
            ? members.map((m) => m[FieldNames.member] as number).filter((m) => m !== 0)
            : [];
    }
}
