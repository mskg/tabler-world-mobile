import { ConsoleLogger } from '@mskg/tabler-world-common';
import { DocumentClient, Key } from 'aws-sdk/clients/dynamodb';
import { dynamodb as client } from '../aws/dynamodb';
import { WebsocketEvent } from '../types/WebsocketEvent';
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
            IndexName: 'last_conversation',

            ProjectionExpression: `${FieldNames.lastConversation}`,

            // newest channels on top
            ScanIndexForward: false,
        }).promise();

        logger.log('getConversations', member, ConsumedCapacity);

        return channels
            ? {
                nextKey,
                result: channels.map((m) => {
                    const combinedKey = m[FieldNames.lastConversation] as string;
                    const [, conversation] = combinedKey.split('_');

                    return conversation;
                }) as string[],
            }
            : EMPTY_RESULT;
    }

    public async getConversation(conversation: string): Promise<any> {
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

    public async update(conversation: string, { id: eventId }: WebsocketEvent<any>): Promise<void> {
        logger.log(`[${conversation}]`, 'update', eventId);

        const { Attributes: result } = await client.update({
            TableName: CONVERSATIONS_TABLE,

            Key: {
                [FieldNames.conversation]: conversation,
                [FieldNames.member]: 0,
            },

            UpdateExpression: `set ${FieldNames.lastMessage} = :s`,
            ExpressionAttributeValues: {
                ':s': eventId,
            },

            ReturnValues: 'ALL_NEW',
        }).promise();

        if (!result) {
            logger.error('No result?');
            return;
        }

        await client.batchWrite({
            RequestItems: {
                [CONVERSATIONS_TABLE]: result[FieldNames.members].values.map((member: number) => ({
                    PutRequest: {
                        Item: {
                            [FieldNames.conversation]: conversation,
                            [FieldNames.member]: member,
                            [FieldNames.lastConversation]: `${eventId}_${conversation}`,
                        },
                    },
                })),
            },
        }).promise();
    }

    public async removeMembers(conversation: string, members: number[]): Promise<void> {
        logger.log(`[${conversation}]`, 'removeMembers', members);

        await client.batchWrite({
            RequestItems: {
                [CONVERSATIONS_TABLE]: members.map((member) => ({
                    DeleteRequest: {
                        Key: {
                            [FieldNames.conversation]: conversation,
                            [FieldNames.member]: member,
                        },
                    },
                })),
            },
        }).promise();

        await client.update({
            TableName: CONVERSATIONS_TABLE,

            Key: {
                [FieldNames.conversation]: conversation,
                [FieldNames.member]: 0,
            },

            UpdateExpression: `DELETE ${FieldNames.members} :m`,
            ExpressionAttributeValues: {
                ':m': client.createSet(members),
            },
        }).promise();
    }

    public async addMembers(conversation: string, members: number[]): Promise<void> {
        logger.log(`[${conversation}]`, 'addMembers', members);

        await client.batchWrite({
            RequestItems: {
                [CONVERSATIONS_TABLE]: members.map((member) => ({
                    PutRequest: {
                        Item: {
                            [FieldNames.conversation]: conversation,
                            [FieldNames.member]: member,
                            [FieldNames.lastConversation]: `0_${conversation}`,
                        },
                    },
                })),
            },
        }).promise();

        await client.update({
            TableName: CONVERSATIONS_TABLE,

            Key: {
                [FieldNames.conversation]: conversation,
                [FieldNames.member]: 0,
            },

            UpdateExpression: `ADD ${FieldNames.members} :m`,
            ExpressionAttributeValues: {
                ':m': client.createSet(members),
            },
        }).promise();
    }
}
