import gql from 'graphql-tag';
import { ConversationOverviewFragment } from './ConversationOverviewFragment';

export const conversationUpdateSubscription = gql`
	subscription conversationUpdate {
		conversationUpdate {
            ...ConversationOverviewFragment
        }
    }

    ${ConversationOverviewFragment}
`;
