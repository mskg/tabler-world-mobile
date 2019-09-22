import { gql } from 'apollo-server-lambda';
import { makeExecutableSchema } from 'graphql-tools';
import { ChannelManager } from '../models/ChannelManager';
import { SubscriptionManager } from '../models/SubscriptionManager';
import { IChatContext } from '../types/IApolloContext';
import publish from '../utils/publish';
import { pubsub } from '../utils/pubsub';

const typeDefs = gql`
    scalar Date
    scalar JSON

	type Query {
		channels: [Channel!]
	}

    type Member {
        id: ID
    }

    enum MessageType {
        text
        join
        leave
    }

    type Message {
        id: ID!
        createdAt: Date!
        sender: Member!
        type: MessageType!
        payload: JSON
    }

    type MessageIterator {
        messages: [Message!]
        nextToken: String
    }

    type Channel {
        id: ID
        owners: [Member!]!
        members: [Member!]!

        messages(token: String): MessageIterator!
    }

	type Mutation {
        startConversation(member: Int!): Channel
		sendMessage(channel: ID!, message: String!): Message
	}

	type Subscription {
		messages: Message
	}
`;

type Args = {
    channel: string,
    message: any,
};

type Root = {
    id: string,
    type: 'start',
    payload: any,
};

type Context = {
    connectionId: string,
};

const subscriptionManager = new SubscriptionManager();
const channelManager = new ChannelManager();

const resolvers = {
    Query: {
        channels: async () => {
            return [
                {
                    id: 'MY_TOPIC',
                },
            ];
        },
    },

    Mutation: {
        startConversation: async (_root: {}, args: { member: number }, context: IChatContext) => {
            const id = `conv_${context.principal.id}_${args.member}`;

            await channelManager.subscribe(id, context.principal.id);
            await channelManager.subscribe(id, args.member);

            return {
                id,
                owners: [args.member],
                members: [args.member],
            };
        },

        // tslint:disable-next-line: variable-name
        sendMessage: async (_root: {}, { message, channel }: Args) => {
            return await publish(channel, {
                sender: 10430,
                payload: message,
                createdAt: new Date(),
                type: 'text',
            });
        },
    },

    Subscription: {
        // we don't need to do anything here
        // publishing is done by DynamoDB streams
        messages: {
            resolve: (rootValue: any) => {
                // root value is the payload from sendMessage mutation
                return rootValue;
            },

            subscribe: async (root: Root, _args: any, { connectionId }: Context, image: any) => {
                // if we resolve, root is null
                if (root) {
                    await subscriptionManager.subscribe(connectionId, root.id, image.rootValue.payload);
                }

                return pubsub.asyncIterator('NEW_MESSAGE');
            },
        },
    },
};

export const schema = makeExecutableSchema<IChatContext>({
    typeDefs,

    // @ts-ignore
    resolvers,
});
