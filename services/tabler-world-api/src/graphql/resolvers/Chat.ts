import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import * as crypto from 'crypto';
import { reverse } from 'lodash';
import { S3, UPLOAD_BUCKET } from '../helper/S3';
import { conversationManager, eventManager, pushSubscriptionManager, subscriptionManager } from '../subscriptions';
import { decodeIdentifier } from '../subscriptions/decodeIdentifier';
import { encodeIdentifier } from '../subscriptions/encodeIdentifier';
import { pubsub } from '../subscriptions/services/pubsub';
import { ALL_CHANNEL_PREFIX, ALL_CHANNEL_SUFFIX, DIRECT_CHAT_PREFIX, DIRECT_CHAT_SUFFIX, MEMBER_ENCLOSING, MEMBER_SEPERATOR } from '../subscriptions/types/Constants';
import { WebsocketEvent } from '../subscriptions/types/WebsocketEvent';
import { getChatParams } from '../subscriptions/utils/getChatParams';
import { IApolloContext } from '../types/IApolloContext';
import { ISubscriptionContext } from '../types/ISubscriptionContext';

type SendMessageArgs = {
    message: {
        id: string,
        conversationId: string,
        text?: string,
        image?: string,
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
    image = 'image',
}

type ChatMessage = {
    id: string,
    senderId: number,
    payload:
    | { type: MessageType.text, text: string }
    | { type: MessageType.image, image: string, text?: string },
    receivedAt: number,
};

type ChatMessageWithTransport = {
    eventId: string,

    accepted?: boolean | null,
    delivered?: boolean | null,
} & ChatMessage;

/**
 * CONV(:1:,:2:)
 * @param members
 */
function makeConversationKey(members: number[]): string {
    return `${DIRECT_CHAT_PREFIX}${members.sort().map((m) => `${MEMBER_ENCLOSING}${m}${MEMBER_ENCLOSING}`).join(MEMBER_SEPERATOR)}${DIRECT_CHAT_SUFFIX}`;
}

// this is a very simple security check that is now sufficient in the 1:1 test
function checkChannelAccess(channel: string, member: number): boolean {
    return decodeIdentifier(channel).match(new RegExp(`${MEMBER_ENCLOSING}${member}${MEMBER_ENCLOSING}`, 'g'));
}

/**
 * ALL(:1:)
 * @param member
 */
function makeAllConversationKey(member: number): string {
    return `${ALL_CHANNEL_PREFIX}${member}${ALL_CHANNEL_SUFFIX}`;
}

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
                // index is reverse, list is other way round
                nodes: reverse(result.result.map((c) => ({ id: c }))),
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
            if (EXECUTING_OFFLINE) { return root.id !== context.principal.id; }

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
            const principalId = context.principal.id;

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

            // only if the token is null we have seen the last values
            if (args.token == null && result.result.length > 0) {
                // const [, conversation] =
                await Promise.all([
                    conversationManager.updateLastSeen(
                        channel,
                        principalId,
                        // highest message
                        result.result[0].id,
                    ),

                    // conversationManager.getConversation(channel),
                ]);

                // await Promise.all(
                //     (conversation.members?.values || []).map((subscriber) => eventManager.post<string>({
                //         trigger: makeAllConversationKey(subscriber),
                //         // payload is the trigger
                //         payload: root.id,
                //         pushNotification: undefined,
                //         ttl: params.ttl,
                //         trackDelivery: false,
                //     })),
                // );
            }

            let lastSeen: string | undefined;
            if (result.result.find((m) => !m.delivered)) {
                context.logger.log('Not all message seen');

                const conversation = await conversationManager.getConversation(channel);
                const otherMember = (conversation.members || { values: [] }).values.filter((m) => m !== context.principal.id);

                if (otherMember.length > 0) {
                    const conv = await conversationManager.getUserConversation(channel, otherMember[0]);
                    lastSeen = conv.lastSeen;
                }

                context.logger.log('otherMember', otherMember, 'lastSeen', lastSeen);
            }

            return {
                nodes: result.result.map((m) => ({
                    // transport informationo
                    conversationId: channel,
                    eventId: m.id,

                    // payload
                    ...m.payload,

                    accepted: true,
                    delivered: m.delivered || (lastSeen && m.id <= lastSeen),
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

    ChatMessagePayload: {
        image: async (root: { image: string }, _args: any, context: IApolloContext) => {
            if (!root.image) {
                return null;
            }

            if (root.image.toLowerCase().match(/x\-amz\-signature/)) {
                return root.image;
            }

            const params = await getChatParams();
            const url = S3.getSignedUrl('getObject', {
                Bucket: UPLOAD_BUCKET,
                Key: root.image,
                Expires: params.attachmentsTTL,
            });

            if (EXECUTING_OFFLINE && context.clientInfo.os === 'android' && context.clientInfo.version === 'dev') {
                // default redirect for anroid emular
                return url.replace(/localhost/ig, '10.0.2.2');
            }

            return url;
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
        prepareFileUpload: async (_root: {}, args: { conversationId: string }, context: IApolloContext) => {
            if (!checkChannelAccess(args.conversationId, context.principal.id)) {
                throw new Error('Access denied.');
            }

            const filename = crypto.randomBytes(24).toString('hex');

            const result = S3.createPresignedPost({
                Bucket: UPLOAD_BUCKET,
                Conditions: [
                    ['content-length-range', 100, 3 * 1000 * 1000],
                    ['eq', '$Content-Type', 'image/jpeg'],
                ],
                Expires: 600, // 10 minutes
                Fields: {
                    key: `${args.conversationId}/${filename}.jpg`,
                    // key: `${filename}`,
                },
            });

            context.logger.log(result);
            return result;
        },

        // tslint:disable-next-line: variable-name
        leaveConversation: async (_root: {}, { id }: IdArgs, context: IApolloContext) => {
            context.logger.log('leaveConverstaion', id);

            if (!checkChannelAccess(id as string, context.principal.id)) {
                throw new Error('Access denied.');
            }

            await Promise.all([
                conversationManager.removeMembers(decodeIdentifier(id as string), [context.principal.id]),

                // we make this generic and always leave, even if that does not exist for a 1:1
                pushSubscriptionManager.unsubscribe(decodeIdentifier(id as string), [context.principal.id]),
            ]);

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
            context.logger.log('startConversation', args.member);

            if (context.principal.id === args.member) {
                throw new Error('You cannot chat with yourself.');
            }

            const id = makeConversationKey([context.principal.id, args.member]);

            const existing = await context.dataSources.conversations.readConversation(id);
            if ((existing?.members?.values || []).find((m) => m === context.principal.id)) {
                return {
                    id,

                    // most likely this is wrong as we are also part of the conversation
                    members: existing?.members?.values.filter((f) => f === context.principal.id),
                };
            }

            await Promise.all([
                conversationManager.addMembers(id, [context.principal.id, args.member]),
                pushSubscriptionManager.subscribe(id, [context.principal.id, args.member]),
            ]);

            return {
                id,
                members: [args.member],
            };
        },

        // tslint:disable-next-line: variable-name
        sendMessage: async (_root: {}, { message }: SendMessageArgs, context: IApolloContext) => {
            context.logger.log('sendMessage', message);
            const principalId = context.principal.id;

            if (!checkChannelAccess(message.conversationId, principalId)) {
                throw new Error('Access denied.');
            }

            const member = await context.dataSources.members.readOne(principalId);

            const trigger = decodeIdentifier(message.conversationId);
            const params = await getChatParams();

            const text = message.text || 'New message';

            if (message.image) {
                // some basic level of security here
                if (!message.image.startsWith(message.conversationId)) {
                    throw new Error('Access denied.');
                }
            }

            const channelMessage = await eventManager.post<ChatMessage>({
                trigger,

                payload: ({
                    id: message.id,
                    senderId: principalId,
                    payload: {
                        image: message.image,
                        type: message.image ? MessageType.image : MessageType.text,
                        text: message.text,
                    },
                    receivedAt: Date.now(),
                } as ChatMessage),

                pushNotification: {
                    message: {
                        title: `${member.firstname} ${member.lastname}`,
                        body: text.length > 199 ? `${text.substr(0, 197)}...` : text,
                        reason: 'chatmessage',
                        options: {
                            sound: 'default',
                            ttl: 60 * 60 * 24,
                            priority: 'high',
                        },
                    },

                    sender: principalId,
                },
                ttl: params.messageTTL,
                trackDelivery: true,
            });

            const [, , conversation] = await Promise.all([
                // TOOD: cloud be combined into onewrite
                conversationManager.update(trigger, channelMessage),
                conversationManager.updateLastSeen(trigger, principalId, channelMessage.id),
                context.dataSources.conversations.readConversation(trigger),
            ]);

            // we optimize this: who is not subscribed does not need a receipt
            await Promise.all(
                (conversation?.members?.values || []).map((subscriber) => eventManager.post<string>({
                    trigger: makeAllConversationKey(subscriber),
                    // payload is the trigger
                    payload: trigger,
                    pushNotification: undefined,
                    ttl: params.messageTTL,
                    trackDelivery: false,
                })),
            );

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
            subscribe: async (root: SubscriptionArgs, _args: ChatMessageSubscriptionArgs, context: ISubscriptionContext, image: any) => {
                const topic = makeAllConversationKey(context.principal.id);

                // if we resolve, root is null
                if (root) {
                    context.logger.log('subscribe', root.id, topic);

                    await subscriptionManager.subscribe(
                        context,
                        root.id,
                        [topic],
                        image.rootValue.payload,
                    );
                }

                return pubsub.asyncIterator(topic);

                // // this will be very very expensive
                // return withFilter(
                //     () => pubsub.asyncIterator(ALL_CONVERSATIONS_TOPIC),
                //     (event: WebsocketEvent<string>): boolean => {
                //         return checkChannelAccess(event.payload, context.principal.id);
                //         //     const channel = await conversationManager.getConversation(payload.eventName);
                //         //     return channel.members != null && (channel.members.values.find((m) => m === context.principal.id) != null);
                //     },
                // )(root, args, context, image);
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
                    context.logger.log('subscribe', root.id, args.conversation);

                    if (!checkChannelAccess(args.conversation, context.principal.id)) {
                        throw new Error('Access denied.');
                    }

                    await subscriptionManager.subscribe(
                        context,
                        root.id,
                        [decodeIdentifier(args.conversation)],
                        image.rootValue.payload,
                    );
                }

                return pubsub.asyncIterator(decodeIdentifier(args.conversation));
            },
        },
    },
};
