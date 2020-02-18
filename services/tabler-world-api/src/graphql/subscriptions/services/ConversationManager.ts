import { BatchWrite, WriteRequest } from '@mskg/tabler-world-aws';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import DynamoDB, { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { dynamodb as client } from '../aws/dynamodb';
import { ALL_CHANNEL_PREFIX, ALL_CHANNEL_SUFFIX, DIRECT_CHAT_PREFIX, DIRECT_CHAT_SUFFIX, MEMBER_ENCLOSING, MEMBER_SEPERATOR } from '../types/Constants';
import { WebsocketEvent } from '../types/WebsocketEvent';
import { CONVERSATIONS_TABLE, FieldNames } from './Constants';

const logger = new ConsoleLogger('Conversation');

type PaggedResponse<T> = {
    result: T[]
    nextKey?: DocumentClient.Key,
};

const EMPTY_RESULT = { result: [] };

export type UserConversation = {
    lastSeen?: string,
};

export type Conversation = {
    lastMessage?: string,
    members?: DynamoDB.DocumentClient.NumberSet,
    channelKey?: string,
};

type QueryOptions = {
    pageSize: number,
    token?: DocumentClient.Key,
};

export class ConversationManager {
    /**
     * CONV(:1:,:2:)
     * @param members
     */
    // tslint:disable-next-line: function-name
    public static MakeConversationKey(member1: number, member2: number): string {
        return `${DIRECT_CHAT_PREFIX}${[member1, member2].sort().map((m) => `${MEMBER_ENCLOSING}${m}${MEMBER_ENCLOSING}`).join(MEMBER_SEPERATOR)}${DIRECT_CHAT_SUFFIX}`;
    }

    /**
     * ALL(:1:)
     * @param member
     */
    // tslint:disable-next-line: function-name
    public static MakeAllConversationKey(member: number): string {
        return `${ALL_CHANNEL_PREFIX}${member}${ALL_CHANNEL_SUFFIX}`;
    }

    public async getConversations(member: number, options: QueryOptions = { pageSize: 10 }): Promise<PaggedResponse<string>> {
        logger.log('getConversations', member);

        const { Items: channels, LastEvaluatedKey: nextKey, ConsumedCapacity } = await client.query({
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

        logger.log('getConversations', member, ConsumedCapacity);

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
        logger.log(`[${conversation}]`, 'get');

        const { Item } = await client.get({
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

    public async getUserConversation(conversation: string, member: number): Promise<UserConversation> {
        logger.log(`[${conversation}]`, 'getUserConversation', member);

        const { Item } = await client.get({
            TableName: CONVERSATIONS_TABLE,

            Key: {
                [FieldNames.conversation]: conversation,
                [FieldNames.member]: member,
            },
        }).promise();

        logger.log(Item);
        return Item as UserConversation;
    }

    /**
     * Updates the lastseen timestamp for a given conversation and memmber.
     *
     * @param conversation
     * @param member
     * @param lastSeen
     */
    public async updateLastSeen(conversation: string, member: number, lastSeen: string) {
        logger.log(`[${conversation}]`, 'updateLastSeen', member, lastSeen);

        // preserve existing data
        await client.update({
            TableName: CONVERSATIONS_TABLE,

            Key: {
                [FieldNames.conversation]: conversation,
                [FieldNames.member]: member,
            },

            UpdateExpression: `SET ${FieldNames.lastSeen} = :l`,
            ExpressionAttributeValues: {
                ':l': lastSeen,
            },
        }).promise();
    }

    /**
     * Updates conversation information with latest update
     *
     * @param conversation
     * @param param1
     */
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

            for await (const item of new BatchWrite(client, items)) {
                logger.log('Wrote', item[0], item[1].PutRequest?.Item[FieldNames.member]);
            }
        }
    }

    public async removeMembers(conversation: string, members: number[]): Promise<void> {
        logger.log(`[${conversation}]`, 'removeMembers', members);

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

        for await (const item of new BatchWrite(client, items)) {
            logger.log('Wrote', item[0], item[1].DeleteRequest?.Key[FieldNames.member]);
        }

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

        for await (const item of new BatchWrite(client, items)) {
            logger.log('Wrote', item[0], item[1].PutRequest?.Item[FieldNames.member]);
        }

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

    /**
     * Check if a given member is part of a conversation
     *
     * @param conversation
     * @param member
     */
    public async checkAccess(conversation: string, member: number) {
        if (conversation.startsWith(DIRECT_CHAT_PREFIX)) {
            return conversation.match(new RegExp(`${MEMBER_ENCLOSING}${member}${MEMBER_ENCLOSING}`, 'g'));
        }

        const conv = await this.getConversation(conversation);
        return (conv.members || { values: [] as number[] }).values.find((m) => m === member) != null;
    }
}
