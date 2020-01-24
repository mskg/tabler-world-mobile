import gql from 'graphql-tag';

export const RemoveConversationMutation = gql`
	mutation RemoveConversation($id: ID!) {
		leaveConversation(id: $id)
	}
`;
