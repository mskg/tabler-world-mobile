import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { conversationManager, eventManager, pushSubscriptionManager, subscriptionManager } from '../subscriptions';
import { decodeIdentifier } from '../subscriptions/decodeIdentifier';
import { encodeIdentifier } from '../subscriptions/encodeIdentifier';
import { pubsub } from '../subscriptions/services/pubsub';
import { WebsocketEvent } from '../subscriptions/types/WebsocketEvent';
import { getChatParams } from '../subscriptions/utils/getChatParams';
import { withFilter } from '../subscriptions/utils/withFilter';
import { IApolloContext } from '../types/IApolloContext';
import { ISubscriptionContext } from '../types/ISubscriptionContext';

type SendMessageArgs = {
    message: {
        id: string,
        conversationId: string,
        payload: string,
    };
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

enum MessageType {
    text = 'text',
}

type ChatMessage = {
    id: string,
    senderId: number,
    payload: any,
    receivedAt: number,
    type: MessageType,
};

type ChatMessageWithTransport = {
    eventId: string,

    accepted?: boolean | null,
    delivered?: boolean | null,
} & ChatMessage;

function makeConversationKey(members: number[]): string {
    return `CONV(${members.sort().map((m) => `:${m}:`).join(',')})`;
}

// this is a very simple security check that is now sufficient in the 1:1 test
function checkChannelAccess(channel: string, member: number): boolean {
    return decodeIdentifier(channel).match(new RegExp(`:${member}:`, 'g'));
}

const ALL_CONVERSATIONS_TOPIC = 'CONV:ALL';

// tslint:disable: export-name
// tslint:disable-next-line: variable-name
export const ChatResolver = {
    Query: {
        // tslint:disable-next-line: variable-name
        Conversations: async (_root: {}, args: IteratorArgs, context: IApolloContext) => {
            const result = await conversationManager.getConversations(
                context.principal.id,
                decodeIdentifier(args.token),
            );

            return {
                nodes: result.result.map((c) => ({ id: c })),
                nextToken: encodeIdentifier(result.nextKey),
            };
        },

        // tslint:disable-next-line: variable-name
        Conversation: (_root: {}, args: IdArgs, context: IApolloContext) => {
            if (!checkChannelAccess(args.id as string, context.principal.id)) {
                throw new Error(`Access denied (${args.id}, ${context.principal.id})`);
            }

            return {
                id: decodeIdentifier(args.id as string),
            };
        },
    },

    Member: {
        availableForChat: (root: { id: number }, _args: {}, context: IApolloContext) => {
            if (EXECUTING_OFFLINE) { return true; }

            return root.id !== context.principal.id
                ? context.dataSources.conversations.isMemberAvailableForChat(root.id)
                : false;
        },
    },

    Conversation: {
        id: (root: { id: string }) => {
            return encodeIdentifier(root.id);
        },

        // tslint:disable-next-line: variable-name
        messages: async (root: { id: string }, args: IteratorArgs, context: IApolloContext) => {
            if (!checkChannelAccess(root.id, context.principal.id)) {
                throw new Error(`Access denied (${root.id}, ${context.principal.id})`);
            }

            const channel = decodeIdentifier(root.id);
            const params = await getChatParams();
            const result = await eventManager.events<ChatMessage>(
                channel,
                {
                    token: decodeIdentifier(args.token),
                    pageSize: params.eventsPageSize,
                    forward: false,
                },
            );

            if (result.result.length > 0) {
                conversationManager.updateLastSeen(
                    channel,
                    context.principal.id,
                    encodeIdentifier(
                        // highest message
                        result.result[result.result.length - 1].id,
                    ) as string,
                );

                // Conversation did update
                await eventManager.post<string>({
                    trigger: ALL_CONVERSATIONS_TOPIC,
                    // payload is the trigger
                    payload: channel,
                    pushNotification: undefined,
                    ttl: params.ttl,
                    trackDelivery: false,
                });
            }

            return {
                nodes: result.result.map((m) => ({
                    // transport informationo
                    conversationId: channel,
                    eventId: m.id,

                    // payload
                    ...m.payload,

                    accepted: true,
                    delivered: m.delivered,
                } as ChatMessageWithTransport)),

                nextToken: encodeIdentifier(result.nextKey),
            };
        },

        // tslint:disable-next-line: variable-name
        hasUnreadMessages: async (root: { id: string }, _args: {}, context: IApolloContext) => {
            const channel = decodeIdentifier(root.id);

            const user = await context.dataSources.conversations.readUserConversation(channel, context.principal.id);
            const global = await context.dataSources.conversations.readConversation(channel);

            context.logger.log(user, global);

            if (user == null || global == null) { return true; }
            if (!user.lastSeen && global.lastMessage) { return true; }
            if (!global.lastMessage) { return false; }

            // @ts-ignore
            return user.lastSeen < global.lastMessage;
        },

        // tslint:disable-next-line: variable-name
        members: async (root: { id: string }, _args: {}, context: IApolloContext) => {
            const channel = decodeIdentifier(root.id);
            const result = await context.dataSources.conversations.readConversation(channel);

            const members = result ? result.members : null;
            if (!members || members.values.length === 0) { return []; }

            const values = members.values.filter((v) => v !== context.principal.id);
            return context.dataSources.members.readMany(values);
        },
    },

    ChatMessage: {
        receivedAt: (root: { receivedAt: number }) => {
            return new Date(root.receivedAt).toISOString();
        },

        // could change this to lazy load
        // tslint:disable-next-line: variable-name
        sender: (root: any, _args: {}, context: IApolloContext) => {
            return context.dataSources.members.readOne(root.senderId);
        },
    },

    Mutation: {
        // tslint:disable-next-line: variable-name
        leaveConversation: async (_root: {}, { id }: IdArgs, context: IApolloContext) => {
            if (!checkChannelAccess(id as string, context.principal.id)) {
                throw new Error('Access denied.');
            }

            await conversationManager.removeMembers(id as string, [context.principal.id]);
            await pushSubscriptionManager.unsubscribe(id as string, [context.principal.id]);

            return true;
        },

        startConversation: async (
            // tslint:disable-next-line: variable-name
            _root: {},
            args: {
                member: number;
            },
            context: IApolloContext,
        ) => {
            if (context.principal.id === args.member) {
                throw new Error('You cannot chat with yourself.');
            }

            // make id stable
            const id = makeConversationKey([context.principal.id, args.member]);

            await conversationManager.addMembers(id, [context.principal.id, args.member]);
            await pushSubscriptionManager.subscribe(id, [context.principal.id, args.member]);

            return {
                id,
                owners: [args.member],
                members: [args.member],
            };
        },

        // tslint:disable-next-line: variable-name
        sendMessage: async (_root: {}, { message }: SendMessageArgs, context: IApolloContext) => {
            if (!checkChannelAccess(message.conversationId, context.principal.id)) {
                throw new Error('Access denied.');
            }

            const member = await context.dataSources.members.readOne(context.principal.id);

            const trigger = decodeIdentifier(message.conversationId);
            const params = await getChatParams();
            const channelMessage = await eventManager.post<ChatMessage>({
                trigger,
                payload: ({
                    id: message.id,
                    senderId: context.principal.id,
                    payload: message.payload,
                    receivedAt: Date.now(),
                    type: MessageType.text,
                } as ChatMessage),
                pushNotification: {
                    message: {
                        title: `${member.firstname} ${member.lastname}`,
                        body: message.payload.length > 199 ? `${message.payload.substr(0, 197)}...` : message.payload,
                        reason: 'chatmessage',
                        options: {
                            sound: 'default',
                            ttl: 60 * 60 * 24,
                            priority: 'high',
                        },
                    },
                    sender: context.principal.id,
                },
                ttl: params.ttl,
                trackDelivery: true,
            });

            // TOOD: cloud be combined into onewrite
            await conversationManager.update(trigger, channelMessage);
            await conversationManager.updateLastSeen(trigger, context.principal.id, channelMessage.id);

            // Conversation did update
            await eventManager.post<string>({
                trigger: ALL_CONVERSATIONS_TOPIC,
                // payload is the trigger
                payload: trigger,
                pushNotification: undefined,
                ttl: params.ttl,
                trackDelivery: false,
            });

            return {
                ...channelMessage.payload,
                eventId: channelMessage.id,
                conversationId: channelMessage.eventName,
                accepted: true,
                delivered: false,
            } as ChatMessageWithTransport;
        },
    },

    Subscription: {
        conversationUpdate: {
            // tslint:disable-next-line: variable-name
            subscribe: async (root: SubscriptionArgs, args: ChatMessageSubscriptionArgs, context: ISubscriptionContext, image: any) => {
                // if we resolve, root is null
                if (root) {
                    await subscriptionManager.subscribe(
                        context.connectionId,
                        root.id,
                        [ALL_CONVERSATIONS_TOPIC],
                        context.principal,
                        image.rootValue.payload,
                    );
                }

                // this will be very very expensive
                return withFilter(
                    () => pubsub.asyncIterator(ALL_CONVERSATIONS_TOPIC),
                    (event: WebsocketEvent<string>): boolean => {
                        return checkChannelAccess(event.payload, context.principal.id);
                        //     const channel = await conversationManager.getConversation(payload.eventName);
                        //     return channel.members != null && (channel.members.values.find((m) => m === context.principal.id) != null);
                    },
                )(root, args, context, image);
            },

            // tslint:disable-next-line: variable-name
            resolve: (channelMessage: WebsocketEvent<string>, _args: {}, _context: ISubscriptionContext) => {
                return {
                    // eventId: channelMessage.id,
                    id: channelMessage.payload,
                };
            },
        },

        newChatMessage: {
            // tslint:disable-next-line: variable-name
            resolve: (channelMessage: WebsocketEvent<ChatMessageWithTransport>, _args: {}, _context: ISubscriptionContext) => {
                return {
                    eventId: channelMessage.id,
                    conversationId: channelMessage.eventName,
                    delivered: channelMessage.delivered,
                    accepted: true,
                    ...channelMessage.payload,
                } as ChatMessageWithTransport;
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
