import { gql } from 'apollo-server-lambda';

export const Chat = gql`
    enum MessageType {
        text
        join
        leave
    }

    type ChatMessage {
        id: ID!
        conversation: Conversation!
        createdAt: Date!
        sender: Member!
        type: MessageType!
        payload: JSON
    }

    type ChatMessageIterator {
        nodes: [ChatMessage!]
        nextToken: String
    }

    type ConversationIterator {
        nodes: [Conversation!]
        nextToken: String
    }

    type Conversation {
        id: ID!
        # owners: [Member!]!
        # members: [Member!]!

        messages(token: String): ChatMessageIterator!
    }

    extend type Query {
		Conversations(token: String): ConversationIterator!
        Conversation(id: ID!): Conversation
	}

	extend type Mutation {
        startConversation(member: Int!): Conversation
		sendMessage(conversation: ID!, message: String!): ChatMessage
	}

	type Subscription {
		ChatMessages: ChatMessage
	}
`;
