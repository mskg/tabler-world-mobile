import { BatchWrite, WriteRequest } from '@mskg/tabler-world-aws';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { PaggedResponse, QueryOptions } from '@mskg/tabler-world-graphql-subscriptions';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { CONVERSATIONS_TABLE, DIRECT_CHAT_PREFIX, FieldNames } from './Constants';
import { Conversation } from './Conversation';
import { IConversationStorage } from './IConversationStorage';
import { UserConversation } from './UserConversation';

const logger = new ConsoleLogger('dynamodb');

const EMPTY_RESULT = { result: [] };

export class DynamoDBConversationStorage implements IConversationStorage {
    constructor(private client: DocumentClient) {
    }

    public async getConversations(member: number, options: QueryOptions = { forward: false, pageSize: 10 }): Promise<PaggedResponse<string>> {
        logger.debug('getConversations', member);

        const { Items: channels, LastEvaluatedKey: nextKey } = await this.client.query({
            TableName: CONVERSATIONS_TABLE,
            ExclusiveStartKey: options.token,
            Limit: options.pageSize,

            KeyConditionExpression: `${FieldNames.member} = :member`,
            ExpressionAttributeValues: {
                ':member': member,
            },
            IndexName: 'last_conversation',

            ProjectionExpression: `${FieldNames.lastConversation}`,

            // newest channels on top
            ScanIndexForward: false,
        }).promise();

        return channels
            ? {
                nextKey,
                result: channels
                    .map((m) => {
                        const combinedKey = m[FieldNames.lastConversation] as string;
                        const [event, conversation] = combinedKey.split('_');

                        // no message has been sent in this channel
                        if (event === '0') { return null; }

                        return conversation;
                    })
                    .filter((c) => c != null) as string[],
            }
            : EMPTY_RESULT;
    }

    public async getConversation(conversation: string): Promise<Conversation> {
        logger.debug(`[${conversation}]`, 'get');

        const { Item } = await this.client.get({
            TableName: CONVERSATIONS_TABLE,

            Key: {
                [FieldNames.conversation]: conversation,
                [FieldNames.member]: 0,
            },
        }).promise();

        if (Item && conversation.startsWith(DIRECT_CHAT_PREFIX)) {
            // this is a one:one conversation
            const [a, b] = conversation
                .replace(/CONV\(|\)|:/ig, '')
                .split(',');

            const [aId, bId] = [parseInt(a, 10), parseInt(b, 10)];

            // we fix that to always be 2 members
            Item[FieldNames.members] = { type: 'Number', values: [aId, bId] };
        }

        return Item as Conversation;
    }

    public async getUserConversation(conversation: string, member: number): Promise<UserConversation | undefined> {
        logger.debug(`[${conversation}]`, 'getUserConversation', member);

        const { Item } = await this.client.get({
            TableName: CONVERSATIONS_TABLE,

            Key: {
                [FieldNames.conversation]: conversation,
                [FieldNames.member]: member,
            },
        }).promise();

        logger.debug(Item);
        return Item as UserConversation;
    }

    public async updateLastSeen(conversation: string, member: number, lastSeen: string) {
        logger.debug(`[${conversation}]`, 'updateLastSeen', member, lastSeen);

        try {


            // preserve existing data
            await this.client.update({
                TableName: CONVERSATIONS_TABLE,

                Key: {
                    [FieldNames.conversation]: conversation,
                    [FieldNames.member]: member,
                },

                UpdateExpression: `SET ${FieldNames.lastSeen} = :l`,
                ConditionExpression: `attribute_not_exists(${FieldNames.lastSeen}) or ${FieldNames.lastConversation} <= :l`,
                ExpressionAttributeValues: {
                    ':l': lastSeen,
                },
            }).promise();
        } catch (e) {
            if (e.code === 'ConditionalCheckFailedException') {
                logger.log('Condition failed', conversation, member, lastSeen);
            } else {
                throw e;
            }
        }
    }

    public async update(conversation: string, eventId: string): Promise<void> {
        logger.debug(`[${conversation}]`, 'update', eventId);

        const { Attributes: result } = await this.client.update({
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

        const members = (result[FieldNames.members] || { values: null }).values;
        if (members && members.length !== 0) {
            const items: [string, WriteRequest][] = members.map((member: number) => ([
                CONVERSATIONS_TABLE,
                {
                    // this removes lastseen counter which is ok
                    // as we have a new message arriving, which cannot be already seen
                    PutRequest: {
                        Item: {
                            [FieldNames.conversation]: conversation,
                            [FieldNames.member]: member,
                            [FieldNames.lastConversation]: `${eventId}_${conversation}`,
                        },
                    },
                },
            ]));

            for await (const item of new BatchWrite(this.client, items)) {
                logger.debug('Wrote', item[0], item[1].PutRequest?.Item[FieldNames.member]);
            }
        }
    }

    public async removeMembers(conversation: string, members: number[]): Promise<void> {
        logger.debug(`[${conversation}]`, 'removeMembers', members);

        const items: [string, WriteRequest][] = members.map((member) => ([
            CONVERSATIONS_TABLE,
            {
                DeleteRequest: {
                    Key: {
                        [FieldNames.conversation]: conversation,
                        [FieldNames.member]: member,
                    },
                },
            }]),
        );

        for await (const item of new BatchWrite(this.client, items)) {
            logger.debug('Wrote', item[0], item[1].DeleteRequest?.Key[FieldNames.member]);
        }

        await this.client.update({
            TableName: CONVERSATIONS_TABLE,

            Key: {
                [FieldNames.conversation]: conversation,
                [FieldNames.member]: 0,
            },

            UpdateExpression: `DELETE ${FieldNames.members} :m`,
            ExpressionAttributeValues: {
                ':m': this.client.createSet(members),
            },
        }).promise();
    }

    public async addMembers(conversation: string, members: number[]): Promise<void> {
        logger.debug(`[${conversation}]`, 'addMembers', members);

        const items: [string, WriteRequest][] = members.map((member) => ([
            CONVERSATIONS_TABLE,
            {
                PutRequest: {
                    Item: {
                        [FieldNames.conversation]: conversation,
                        [FieldNames.member]: member,

                        // this is the 0 conversation beeing filtered out in query
                        [FieldNames.lastConversation]: `0_${conversation}`,
                    },
                },
            },
        ]));

        for await (const item of new BatchWrite(this.client, items)) {
            logger.debug('Wrote', item[0], item[1].PutRequest?.Item[FieldNames.member]);
        }

        await this.client.update({
            TableName: CONVERSATIONS_TABLE,

            Key: {
                [FieldNames.conversation]: conversation,
                [FieldNames.member]: 0,
            },

            UpdateExpression: `ADD ${FieldNames.members} :m`,
            ExpressionAttributeValues: {
                ':m': this.client.createSet(members),
            },
        }).promise();
    }
}
