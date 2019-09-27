import gql from 'graphql-tag';
import { ChatMessageFragment } from './ChatMessageFragment';

export const SendMessageMutation = gql`
	mutation SendMessage($id: ID!, $message: String!) {
		# startConversation(member: 1) {
		# 	id
		# }

		sendMessage(message: {payload: $message, conversationId: "IkNPTlYoOjE6LDoxMDQzMDopIg==", id: $id}) {
            ...ChatMessageFragment
		}
	}

    ${ChatMessageFragment}
`;
