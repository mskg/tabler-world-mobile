import gql from 'graphql-tag';
import { ChatMessageFragment } from './ChatMessageFragment';

export const SendMessageMutation = gql`
	mutation SendMessage($id: ID!, $text: String, $image: String, $conversation: ID!) {
		sendMessage(message: { text: $text, image: $image, conversationId: $conversation, id: $id }) {
            ...ChatMessageFragment
		}
	}

    ${ChatMessageFragment}
`;
