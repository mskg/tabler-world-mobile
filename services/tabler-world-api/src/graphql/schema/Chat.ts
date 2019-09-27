import { gql } from 'apollo-server-lambda';

export const Chat = gql`
    enum MessageType {
        text
        join
        leave
    }

    type ChatMessage {
        id: ID!
        eventId: ID!

        conversationId: ID!
        receivedAt: Date!

        senderId: Int
        sender: Member!

        type: MessageType!
        payload: JSON

        # message was sent
        sent: Boolean
    }

    type ChatMessageIterator {
        nodes: [ChatMessage!]!
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

    input SendMessageInput {
        conversationId: ID!
        id: ID!
        payload: String!
    }

    extend type Query {
		Conversations(token: String): ConversationIterator!
        Conversation(id: ID!): Conversation
	}

	extend type Mutation {
        startConversation(member: Int!): Conversation
		sendMessage(message: SendMessageInput!): ChatMessage!
	}

	type Subscription {
		newChatMessage(conversation: ID!): ChatMessage
	}
`;
