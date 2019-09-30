import gql from 'graphql-tag';

export const StartConversationMutation = gql`
	mutation StartConversation($member: Int!) {
		startConversation(member: $member) {
			id
		}
	}
`;
