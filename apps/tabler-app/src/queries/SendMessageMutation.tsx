import gql from 'graphql-tag';
import { ChatMessageFragment } from './ChatMessageFragment';

export const SendMessageMutation = gql`
	mutation SendMessage($id: ID!, $message: String!, $conversation: ID!) {
		sendMessage(message: {payload: $message, conversationId: $conversation, id: $id}) {
            ...ChatMessageFragment
		}
	}

    ${ChatMessageFragment}
`;
