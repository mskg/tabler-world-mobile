import { gql } from 'apollo-server-lambda';

export const Chat = gql`
    enum PayloadType {
        image
        text
        join
        leave
    }

    type ChatMessagePayload {
        type: PayloadType!
        text: String
        image: String
    }

    type ChatMessage {
        id: ID!
        eventId: ID!

        conversationId: ID!
        receivedAt: Date!

        senderId: Int
        sender: Member!

        payload: ChatMessagePayload!

        "Message was received by the server"
        accepted: Boolean

        "Message was delivered to the recipients"
        delivered: Boolean
    }

    type ChatMessageIterator {
        nodes: [ChatMessage!]!
        nextToken: String
    }

    type ConversationIterator {
        nodes: [Conversation!]!
        nextToken: String
    }

    type ConversationParticipant {
        id: ID!
        iscallingidentity: Boolean!

        #isadmin: Boolean
        firstname: String
        lastname: String

        "Can be archived ore removed already"
        member: Member
    }

    type Conversation {
        id: ID!
        # owners: [Member!]!

        hasUnreadMessages: Boolean!

        subject: String!,
        pic: String,

        participants: [ConversationParticipant!]!
        messages(token: String, dontMarkAsRead: Boolean): ChatMessageIterator!
    }

    # type ConversationAndKey {
    #     key: String!
    #     conversation: Conversation!
    # }

    input SendMessageInput {
        conversationId: ID!
        id: ID!

        text: String
        image: String
    }

    extend type Query {
		Conversations(token: String): ConversationIterator!
        Conversation(id: ID!): Conversation
	}

    scalar Dictionary
    type S3PresignedPost {
        url: String!
        fields: Dictionary!
    }

	extend type Mutation {
        prepareFileUpload(conversationId: ID!): S3PresignedPost!
        startConversation(member: Int!): Conversation!
        leaveConversation(id: ID!): Boolean

		sendMessage(message: SendMessageInput!): ChatMessage!
	}

	extend type Subscription {
		newChatMessage(conversation: ID!): ChatMessage!
        conversationUpdate: Conversation!
	}
`;
