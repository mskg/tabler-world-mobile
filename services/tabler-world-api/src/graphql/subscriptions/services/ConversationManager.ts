import { DocumentClient, Key } from 'aws-sdk/clients/dynamodb';
import { dynamodb as client } from '../aws/dynamodb';
import { WebsocketLogger } from '../utils/WebsocketLogger';
import { CONVERSATIONS_TABLE, FieldNames } from './Constants';


const logger = new WebsocketLogger('Conversation');

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


    public async subscribe(conversation: string, member: number[]) {
        logger.log(`[${conversation}]`, 'subscribe', conversation, member);

        return client.batchWrite({
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
    }

    public async unsubscribe(conversation: string, member: number[]) {
        logger.log(`[${conversation}]`, 'unsubscribe', member);

        return client.batchWrite({
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
        return members ? members.map((m) => m[FieldNames.member] as number) : [];
    }
}
