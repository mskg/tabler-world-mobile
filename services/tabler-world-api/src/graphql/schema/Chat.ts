import { gql } from 'apollo-server-lambda';

export const Chat = gql`
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

    extend type Query {
		channels(token: String): ChannelIterator!
	}

	extend type Mutation {
        startConversation(member: Int!): Channel
		sendMessage(channel: ID!, message: String!): Message
	}

	type Subscription {
		messages: Message
	}
`;
