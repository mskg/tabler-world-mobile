import { channelManager, subscriptionManager } from '../subscriptions/services';
import { ChannelMessage } from '../subscriptions/services/ChannelManager';
import { pubsub } from '../subscriptions/services/pubsub';
import { IChatContext } from '../types/IChatContext';
import { ISubscriptionContext } from '../types/ISubscriptionContext';

type Args = {
    channel: string;
    message: any;
};

type Root = {
    id: string;
    type: 'start';
    payload: any;
};

type TokenArgs = {
    token?: string,
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
    return new Buffer(JSON.stringify(token)).toString('base64');
}

function decodeIdentifier(token?: string) {
    // tslint:disable-next-line: possible-timing-attack
    if (token == null || token === '') { return undefined; }
    return JSON.parse(new Buffer(token, 'base64').toString('ascii'));
}

// tslint:disable: export-name
// tslint:disable-next-line: variable-name
export const ChatResolver = {
    Query: {
        // tslint:disable-next-line: variable-name
        channels: async (_root: {}, args: TokenArgs, context: IChatContext) => {
            const result = await channelManager.getChannels(context.principal.id, decodeIdentifier(args.token));

            return {
                nodes: result.result.map((c) => ({ id: encodeIdentifier(c) })),
                nextToken: encodeIdentifier(result.nextKey),
            };
        },
    },

    Channel: {
        id: (root: { id: string }) => {
            return encodeIdentifier(root.id);
        },

        // tslint:disable-next-line: variable-name
        messages: async (root: { id: string }, args: TokenArgs, context: IChatContext) => {
            if (!checkChannelAccess(root.id, context.principal.id)) {
                throw new Error('Access denied.');
            }

            const channel = decodeIdentifier(root.id);
            const result = await channelManager.getMessages(channel, decodeIdentifier(args.token));
            return {
                nodes: result.result.map((m) => ({
                    channel: {
                        id: channel,
                    },
                    id: m.id,
                    createdAt: m.payload.createdAt,
                    sender: {
                        id: m.payload.sender,
                    },
                    type: m.payload.type,
                    payload: m.payload,
                })),
                nextToken: encodeIdentifier(result.nextKey),
            };
        },
    },

    Message: {
        createdAt: (root: { createdAt: number }) => {
            return new Date(root.createdAt).toISOString();
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
            await channelManager.subscribe(id, [context.principal.id, args.member]);

            return {
                id,
                owners: [args.member],
                members: [args.member],
            };
        },

        // tslint:disable-next-line: variable-name
        sendMessage: async (_root: {}, { message, channel }: Args, context: IChatContext) => {
            if (!checkChannelAccess(channel, context.principal.id)) {
                throw new Error('Access denied.');
            }

            const channelMessage = await channelManager.postMessage(decodeIdentifier(channel), {
                sender: context.principal.id,
                payload: message,
                createdAt: Date.now(),
                type: 'text',
            });

            return {
                id: channelMessage.id,
                ...channelMessage.payload,
            };
        },
    },

    Subscription: {
        // we don't need to do anything here, publishing is done by DynamoDB streams
        messages: {
            // tslint:disable-next-line: variable-name
            resolve: (message: ChannelMessage, _args: {}, _context: ISubscriptionContext) => {
                // root value is the payload from sendMessage mutation
                return {
                    id: message.id,
                    channel: {
                        id: message.channel,
                    },
                    ...message.payload,
                };
            },

            // tslint:disable-next-line: variable-name
            subscribe: async (root: Root, _args: any, context: ISubscriptionContext, image: any) => {
                // if we resolve, root is null
                if (root) {
                    await subscriptionManager.subscribe(
                        context.connectionId,
                        root.id,
                        image.rootValue.payload,
                    );
                }

                return pubsub.asyncIterator('NEW_MESSAGE');
            },
        },
    },
};
