import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { AuditAction, StopWatch } from '@mskg/tabler-world-common';
import { pubsub, WebsocketEvent } from '@mskg/tabler-world-lambda-subscriptions';
import { randomBytes } from 'crypto';
import { decodeIdentifier } from '../chat/helper/decodeIdentifier';
import { encodeIdentifier } from '../chat/helper/encodeIdentifier';
import { getChatParams } from '../chat/helper/getChatParams';
import { ConversationManager } from '../chat/services/ConversationManager';
import { Environment } from '../Environment';
import { S3 } from '../helper/S3';
import { IApolloContext } from '../types/IApolloContext';
import { ISubscriptionContext } from '../types/ISubscriptionContext';
import { conversationManager, eventManager, pushSubscriptionManager, subscriptionManager } from '../websocketServer';

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
    dontMarkAsRead?: boolean,
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

// tslint:disable: export-name
// tslint:disable-next-line: variable-name
export const ChatResolver = {
    Query: {
        // tslint:disable-next-line: variable-name
        Conversations: async (_root: {}, args: IteratorArgs, context: IApolloContext) => {
            const timer = new StopWatch();
            try {
                const params = await getChatParams();

                const result = await conversationManager.getConversations(
                    context.principal.id,
                    {
                        token: decodeIdentifier(args.token),
                        pageSize: params.conversationsPageSize,
                    },
                );

                return {
                    // index is reverse, list is other way round
                    nodes: result.result.map((c) => ({ id: c })),
                    nextToken: encodeIdentifier(result.nextKey),
                };
            } finally {
                context.logger.log('Conversations took', timer.elapsedYs, 'ys');
            }
        },

        // tslint:disable-next-line: variable-name
        Conversation: async (_root: {}, args: IdArgs, context: IApolloContext) => {
            const hasAccess = await conversationManager.checkAccess(
                decodeIdentifier(args.id as string),
                context.principal.id,
            );

            if (!hasAccess) {
                throw new Error('Access denied');
            }

            return {
                id: decodeIdentifier(args.id as string),
            };
        },
    },

    Member: {
        availableForChat: (root: { id: number, availableForChat?: boolean }, _args: {}, context: IApolloContext) => {
            if (EXECUTING_OFFLINE) { return root.id !== context.principal.id; }

            return root.id !== context.principal.id
                ? root.availableForChat != null
                    ? root.availableForChat
                    : context.dataSources.conversations.isMemberAvailableForChat(root.id)
                : false;
        },
    },

    Conversation: {
        id: (root: { id: string }, _args: any, context: IApolloContext) => {
            context.auditor.add({ id: root.id, action: AuditAction.Read, type: 'conversation' });
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
                if (!args.dontMarkAsRead) {
                    await conversationManager.updateLastSeen(
                        channel,
                        principalId,
                        // highest message
                        result.result[0].id,
                    );
                }
            }

            let lastSeen: string | undefined;
            if (result.result.find((m) => !m.delivered)) {
                context.logger.log('Not all message seen');

                const conversation = await conversationManager.getConversation(channel);
                const otherMember = (conversation.members || { values: [] }).values.filter((m) => m !== context.principal.id);

                if (otherMember.length > 0) {
                    const conv = await conversationManager.getUserConversation(channel, otherMember[0]);
                    lastSeen = conv?.lastSeen;
                }

                context.logger.log('otherMember', otherMember, 'lastSeen', lastSeen);
            }

            return {
                nodes: result.result.map((m) => ({
                    // transport informationo
                    conversationId: channel,
                    eventId: m.id,

                    // payload has it's own id which would override the id?
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

            context.logger.log('hasUnreadMessages', global, user);

            if (user == null || global == null) { return true; }
            if (!user.lastSeen && global.lastMessage) { return true; }
            if (!global.lastMessage) { return false; }

            // @ts-ignore
            return user.lastSeen < global.lastMessage;
        },

        pic: async (root: { id: string }, _args: {}, context: IApolloContext) => {
            const channel = decodeIdentifier(root.id);

            const result = await context.dataSources.conversations.readConversation(channel);
            const members = result ? result.members : null;
            if (!members || members.values.length === 0) { return null; }

            // const values = ;
            const anyMembers = await context.dataSources.members.readManyWithAnyStatus(
                members.values.filter((v) => v !== context.principal.id));

            return anyMembers.length > 0 ? anyMembers[0].pic : null;
        },

        subject: async (root: { id: string }, _args: {}, context: IApolloContext) => {
            const channel = decodeIdentifier(root.id);

            const result = await context.dataSources.conversations.readConversation(channel);
            const members = result ? result.members : null;
            if (!members || members.values.length === 0) { return 'Unknown'; }

            // const values = ;
            const anyMembers = await context.dataSources.members.readManyWithAnyStatus(
                members.values.filter((v) => v !== context.principal.id));

            return anyMembers.length > 0 ? `${anyMembers[0].firstname} ${anyMembers[0].lastname}` : 'Unkown';
        },

        participants: async (root: { id: string }, _args: {}, context: IApolloContext) => {
            const channel = decodeIdentifier(root.id);

            const result = await context.dataSources.conversations.readConversation(channel);
            const members = result ? result.members : null;
            if (!members || members.values.length === 0) { return []; }

            // const values = members.values.filter((v) => v !== context.principal.id);
            const anyMembers = await context.dataSources.members.readManyWithAnyStatus(
                members.values);

            return anyMembers.map((m) => {
                // only in this case, we return
                if (m.removed) {
                    context.auditor.add({ id: m.id, action: AuditAction.Read, type: 'member-conversation' });

                    return {
                        id: m.id,
                        firstname: m.firstname,
                        lastname: m.lastname,
                        iscallingidentity: m.id === context.principal.id,
                    };
                }

                context.auditor.add({ id: m.id, action: AuditAction.Read, type: 'member' });
                return {
                    id: m.id,
                    firstname: m.firstname,
                    lastname: m.lastname,
                    iscallingidentity: m.id === context.principal.id,
                    member: m,
                };
            });
        },

        // Deprecated
        // tslint:disable-next-line: variable-name
        members: async (root: { id: string }, _args: {}, context: IApolloContext) => {
            const channel = decodeIdentifier(root.id);

            const result = await context.dataSources.conversations.readConversation(channel);
            const members = result ? result.members : null;
            if (!members || members.values.length === 0) { return []; }

            const anyMembers = await context.dataSources.members.readManyWithAnyStatus(
                members.values.filter((v) => v !== context.principal.id));

            return anyMembers.map((m) => {
                // only in this case, we return
                if (m.removed) {
                    context.auditor.add({ id: m.id, action: AuditAction.Read, type: 'member-conversation' });

                    // this is only a workarround to not stop the old
                    // app from working
                    return {
                        id: m.id,
                        lastname: 'Past-Member',
                        firstname: m.firstname,

                        association: m.association,
                        associationname: m.associationname,
                        associationflag: m.associationflag,

                        club: m.club,
                        clubname: m.clubname,
                        clubnumber: m.clubnumber,

                        area: m.area,
                        areaname: m.areaname,

                        availableForChat: false,
                        sharesLocation: false,
                    };
                }

                context.auditor.add({ id: m.id, action: AuditAction.Read, type: 'member' });
                return m;
            });
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
                Bucket: Environment.S3.bucket,
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
        id: (root: { id: string }, _args: any, context: IApolloContext) => {
            context.auditor.add({ id: root.id, action: AuditAction.Read, type: 'chatmessage' });
            return root.id;
        },

        receivedAt: (root: { receivedAt: number }) => {
            return new Date(root.receivedAt).toISOString();
        },

        // could change this to lazy load
        // tslint:disable-next-line: variable-name
        sender: (root: any, _args: {}, context: IApolloContext) => {
            return context.dataSources.members.readOneManyWithAnyStatus(root.senderId);
        },
    },

    Mutation: {
        // tslint:disable-next-line: variable-name
        prepareFileUpload: async (_root: {}, args: { conversationId: string }, context: IApolloContext) => {
            const hasAccess = await conversationManager.checkAccess(
                decodeIdentifier(args.conversationId),
                context.principal.id,
            );

            if (!hasAccess) {
                throw new Error('Access denied.');
            }

            const filename = randomBytes(24).toString('hex');

            const result = S3.createPresignedPost({
                Bucket: Environment.S3.bucket,
                Conditions: [
                    ['content-length-range', 100, Environment.S3.maxSize],
                    ['eq', '$Content-Type', 'image/jpeg'],
                ],
                Expires: 600, // 10 minutes
                Fields: {
                    key: `${args.conversationId}/${filename}.jpg`,
                    // key: `${filename}`,
                },
            });

            context.logger.log(result);

            if (EXECUTING_OFFLINE && context.clientInfo.os === 'android' && context.clientInfo.version === 'dev') {
                // default redirect for anroid emular
                return {
                    ...result,
                    url: result.url.replace(/localhost/ig, '10.0.2.2'),
                };
            }

            return result;
        },

        // tslint:disable-next-line: variable-name
        leaveConversation: async (_root: {}, { id }: IdArgs, context: IApolloContext) => {
            context.logger.log('leaveConverstaion', id);

            const hasAccess = await conversationManager.checkAccess(
                decodeIdentifier(id as string),
                context.principal.id,
            );

            if (!hasAccess) {
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

            const id = ConversationManager.MakeConversationKey(context.principal.id, args.member);

            const existing = await context.dataSources.conversations.readConversation(id);
            if ((existing?.members?.values || []).find((m) => m === context.principal.id)) {
                return {
                    id,

                    // most likely this is wrong as we are also part of the conversation
                    members: existing?.members?.values.filter((f) => f === context.principal.id),
                };
            }

            context.auditor.add({ id, action: AuditAction.Create, type: 'conversation' });

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
            context.logger.log('sendMessage', context.principal.id);
            const principalId = context.principal.id;

            const hasAccess = await conversationManager.checkAccess(
                decodeIdentifier(message.conversationId),
                principalId,
            );

            if (!hasAccess) {
                throw new Error('Access denied.');
            }

            if (message.image) {
                // some basic level of security here
                if (!message.image.startsWith(message.conversationId)) {
                    throw new Error('Access denied.');
                }
            }

            const trigger = decodeIdentifier(message.conversationId);
            const text = message.text || 'New message';

            const [member, params] = await Promise.all([
                context.dataSources.members.readOne(principalId),
                getChatParams(),
            ]);

            const channelMessage = await eventManager.post<ChatMessage & { conversationId: string }>({
                triggers: [trigger],
                sender: principalId,

                trackDelivery: true,
                volatile: false,
                ttl: params.messageTTL,

                payload: {
                    conversationId: message.conversationId,
                    senderId: principalId,
                    id: message.id,
                    // we need the encoded identifier for the push notification

                    // @ts-ignore
                    payload: {
                        type: message.image ? MessageType.image : MessageType.text,
                        image: message.image,
                        text: message.text ? message.text.substring(0, params.maxTextLength) : undefined,
                    },

                    receivedAt: Date.now(),
                },

                pushNotification: {
                    title: `${member.firstname} ${member.lastname}`,
                    body: text.length > 199 ? `${text.substr(0, 197)}...` : text,
                    reason: 'chatmessage',
                    options: {
                        sound: 'default',
                        ttl: 60 * 60 * 24,
                        priority: 'high',
                    },
                },
            });

            const [, conversation] = await Promise.all([
                // TOOD: cloud be combined into onewrite
                conversationManager.update(trigger, channelMessage[0]),
                context.dataSources.conversations.readConversation(trigger),
            ]);

            // this must be done after update as, as update removes all seen flags
            await conversationManager.updateLastSeen(trigger, principalId, channelMessage[0].id);

            await eventManager.post({
                triggers: (conversation?.members?.values || []).map((subscriber) => ConversationManager.MakeAllConversationKey(subscriber)),
                sender: principalId,
                payload: { trigger, plain: true },

                trackDelivery: false,
                ttl: params.messageTTL,

                volatile: true,
                pushNotification: undefined,
            });

            context.auditor.add({ id: channelMessage[0].id, action: AuditAction.Create, type: 'chatmessage' });

            return {
                ...channelMessage[0].payload,
                eventId: channelMessage[0].id,
                conversationId: channelMessage[0].eventName,
                accepted: true,
                delivered: false,
            } as ChatMessageWithTransport;
        },
    },

    Subscription: {
        conversationUpdate: {
            // tslint:disable-next-line: variable-name
            subscribe: async (root: SubscriptionArgs, _args: ChatMessageSubscriptionArgs, context: ISubscriptionContext, image: any) => {
                const topic = ConversationManager.MakeAllConversationKey(context.principal.id);

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
            resolve: (channelMessage: WebsocketEvent<{ trigger: string }>, _args: {}, _context: ISubscriptionContext) => {
                return {
                    // eventId: channelMessage.id,
                    id: channelMessage.payload.trigger,
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

                    const hasAccess = await conversationManager.checkAccess(
                        decodeIdentifier(args.conversation),
                        context.principal.id,
                    );

                    if (!hasAccess) {
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
