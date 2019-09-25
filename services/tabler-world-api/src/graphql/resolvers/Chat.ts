import { conversationManager, eventManager, subscriptionManager } from '../subscriptions';
import { getChatParams } from '../subscriptions/services/getChatParams';
import { pubsub } from '../subscriptions/services/pubsub';
import { WebsocketEvent } from '../subscriptions/services/WebsocketEventManager';
import { IApolloContext } from '../types/IApolloContext';
import { IChatContext } from '../types/IChatContext';
import { ISubscriptionContext } from '../types/ISubscriptionContext';

type SendMessageArgs = {
    conversation: string;
    message: any;
};

type ChatMessageSubscriptionArgs = {
    conversation: string;
};

type SubscriptionArgs = {
    id: string;
    type: 'start';
    payload: any;
};

type IteratorArgs = {
    token?: string,
};

type IdArgs = {
    id: string | number,
};

type ChatMessageEvent = {
    senderId: number,
    payload: any,
    createdAt: number,
    type: string,
};

function makeConversationKey(members: number[]) {
    return `CONV(${members.sort().map((m) => `:${m}:`).join(',')})`;
}

// this is a very simple security check that is now sufficient in the 1:1 test
function checkChannelAccess(channel: string, member: number) {
    return decodeIdentifier(channel).match(new RegExp(`:${member}:`, 'g'));
}

function encodeIdentifier(token?: any) {
    if (token == null) { return undefined; }
    return Buffer.from(JSON.stringify(token)).toString('base64');
}

function decodeIdentifier(token?: string) {
    // tslint:disable-next-line: possible-timing-attack
    if (token == null || token === '') { return undefined; }
    return JSON.parse(Buffer.from(token, 'base64').toString('ascii'));
}

// tslint:disable: export-name
// tslint:disable-next-line: variable-name
export const ChatResolver = {
    Query: {
        // tslint:disable-next-line: variable-name
        Conversations: async (_root: {}, args: IteratorArgs, context: IApolloContext) => {
            const result = await conversationManager.getConversations(context.principal.id, decodeIdentifier(args.token));

            return {
                nodes: result.result.map((c) => ({ id: encodeIdentifier(c) })),
                nextToken: encodeIdentifier(result.nextKey),
            };
        },

        // tslint:disable-next-line: variable-name
        Conversation: (_root: {}, args: IdArgs, _context: IApolloContext) => {
            return {
                id: args.id,
            };
        },
    },

    Conversation: {
        id: (root: { id: string }) => {
            return encodeIdentifier(root.id);
        },

        // tslint:disable-next-line: variable-name
        messages: async (root: { id: string }, args: IteratorArgs, context: IApolloContext) => {
            if (!checkChannelAccess(root.id, context.principal.id)) {
                throw new Error('Access denied.');
            }

            const channel = decodeIdentifier(root.id);
            const params = await getChatParams();
            const result = await eventManager.events<ChatMessageEvent>(channel, decodeIdentifier(args.token), params.eventsPageSize);

            return {
                nodes: result.result.map((m) => ({
                    conversationId: channel,
                    id: m.id,
                    createdAt: m.payload.createdAt,
                    senderId: m.payload.senderId,
                    type: m.payload.type,
                    payload: m.payload.payload,
                })),
                nextToken: encodeIdentifier(result.nextKey),
            };
        },
    },

    ChatMessage: {
        createdAt: (root: { createdAt: number }) => {
            return new Date(root.createdAt).toISOString();
        },

        // could change this to lazy load
        // tslint:disable-next-line: variable-name
        sender: (root: any, _args: {}, context: IApolloContext) => {
            return context.dataSources.members.readOne(root.senderId);
        },
    },

    Mutation: {
        startConversation: async (
            // tslint:disable-next-line: variable-name
            _root: {},
            args: {
                member: number;
            },
            context: IChatContext,
        ) => {
            if (context.principal.id === args.member) {
                throw new Error('You cannot chat with yourself.');
            }

            // make id stable
            const id = makeConversationKey([context.principal.id, args.member]);
            await conversationManager.subscribe(id, [context.principal.id, args.member]);

            return {
                id,
                owners: [args.member],
                members: [args.member],
            };
        },

        // tslint:disable-next-line: variable-name
        sendMessage: async (_root: {}, { message, conversation }: SendMessageArgs, context: IChatContext) => {
            if (!checkChannelAccess(conversation, context.principal.id)) {
                throw new Error('Access denied.');
            }

            const params = await getChatParams();
            const channelMessage = await eventManager.post<ChatMessageEvent>(
                decodeIdentifier(conversation),
                {
                    senderId: context.principal.id,
                    payload: message,
                    createdAt: Date.now(),
                    type: 'text',
                },
                params.ttl,
            );

            return {
                id: channelMessage.id,
                conversationId: channelMessage.trigger,
                ...channelMessage.payload,
            };
        },
    },

    Subscription: {
        newChatMessage: {
            // tslint:disable-next-line: variable-name
            resolve: (channelMessage: WebsocketEvent<ChatMessageEvent>, _args: {}, _context: ISubscriptionContext) => {
                return {
                    id: channelMessage.id,
                    conversationId: channelMessage.trigger,
                    ...channelMessage.payload,
                };
            },

            // tslint:disable-next-line: variable-name
            subscribe: async (root: SubscriptionArgs, args: ChatMessageSubscriptionArgs, context: ISubscriptionContext, image: any) => {
                // if we resolve, root is null
                if (root) {
                    if (!checkChannelAccess(args.conversation, context.principal.id)) {
                        throw new Error('Access denied.');
                    }

                    await subscriptionManager.subscribe(
                        context.connectionId,
                        root.id,
                        [decodeIdentifier(args.conversation)],
                        context.principal,
                        image.rootValue.payload,
                    );
                }

                return pubsub.asyncIterator(decodeIdentifier(args.conversation));
            },
        },
    },
};
