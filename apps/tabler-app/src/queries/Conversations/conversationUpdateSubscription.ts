import gql from 'graphql-tag';
import { MemberOverviewFragment } from '../Member/MemberOverviewFragment';

export const conversationUpdateSubscription = gql`
	subscription conversationUpdate {
		conversationUpdate {
          hasUnreadMessages
            members {
              ...MemberOverviewFragment
              id
            }
            id
          }
    }

    ${MemberOverviewFragment}
`;
