import gql from 'graphql-tag';
import { ConversationOverviewFragment } from './ConversationOverviewFragment';

export const StartConversationMutation = gql`
	mutation StartConversation($member: Int!) {
		startConversation(member: $member) {
            ...ConversationOverviewFragment
		}
	}

    ${ConversationOverviewFragment}
`;
