import gql from 'graphql-tag';
import { MemberAvatarFragment } from './MemberAvatarFragment';

export const conversationUpdateSubscription = gql`
	subscription conversationUpdate {
		conversationUpdate {
          hasUnreadMessages
            members {
              ...MemberAvatarFragment
            }
            id
          }
    }

    ${MemberAvatarFragment}
`;
