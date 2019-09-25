import gql from 'graphql-tag';

export const SendMessageMutation = gql`
	mutation sendMessage($message: String!) {
		startConversation(member: 1) {
			id
		}

		sendMessage(message: $message, conversation: "IkNPTlYoOjE6LDoxMDQzMDopIg==") {
			id
			payload
			createdAt
		}
	}
`;
