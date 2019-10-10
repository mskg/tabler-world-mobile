import gql from 'graphql-tag';
import { ChatMessageFragment } from './ChatMessageFragment';

export const newChatMessageSubscription = gql`
	subscription newChatMessage ($conversation: ID!) {
		newChatMessage (conversation: $conversation) {
            ...ChatMessageFragment
		}
	}

    ${ChatMessageFragment}
`;
