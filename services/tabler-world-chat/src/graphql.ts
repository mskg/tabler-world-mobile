import { ApolloServer, gql } from 'apollo-server-lambda';
import { makeExecutableSchema } from 'graphql-tools';
import { constructContext } from './constructContext';
import { Channel } from './models/Channel';
import { IChatContext } from './types/IApolloContext';
import publish from './utils/publish';
import { subscribeResolver } from './utils/subscribeResolver';

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
            const channel = new Channel(id);

            await channel.subscribe(context.principal.id);
            await channel.subscribe(args.member);

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
            subscribe: subscribeResolver(),
        },
    },
};

export const schema = makeExecutableSchema<IChatContext>({
    typeDefs,

    // @ts-ignore
    resolvers,
});

const server = new ApolloServer({
    schema,
    context: constructContext,
});

// tslint:disable-next-line: export-name
export const handler = server.createHandler({
    cors: {
        origin: '*',
        credentials: true,
    },
});

