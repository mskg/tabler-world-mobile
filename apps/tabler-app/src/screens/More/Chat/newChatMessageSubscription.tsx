import gql from 'graphql-tag';

export const newChatMessageSubscription = gql`
	subscription newChatMessage {
		newChatMessage (conversation: "IkNPTlYoOjE6LDoxMDQzMDopIg") {
            id
            payload
            senderId
            createdAt
		}
	}
`;
