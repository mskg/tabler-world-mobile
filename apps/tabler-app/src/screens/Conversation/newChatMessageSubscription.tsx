import gql from 'graphql-tag';
import { ChatMessageFragment } from './ChatMessageFragment';

export const newChatMessageSubscription = gql`
	subscription newChatMessage {
		newChatMessage (conversation: "IkNPTlYoOjE6LDoxMDQzMDopIg") {
            ...ChatMessageFragment
		}
	}

    ${ChatMessageFragment}
`;
