import { gql } from 'apollo-server-lambda';

export const typeDefs = gql`
    scalar Date
    scalar JSON

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
        channel: Channel!
        createdAt: Date!
        sender: Member!
        type: MessageType!
        payload: JSON
    }

    type MessageIterator {
        nodes: [Message!]
        nextToken: String
    }

    type ChannelIterator {
        nodes: [Channel!]
        nextToken: String
    }

    type Channel {
        id: ID!
        # owners: [Member!]!
        # members: [Member!]!

        messages(token: String): MessageIterator!
    }

    type Query {
		channels(token: String): ChannelIterator!
	}

	type Mutation {
        startConversation(member: Int!): Channel
		sendMessage(channel: ID!, message: String!): Message
	}

	type Subscription {
		messages: Message
	}
`;
