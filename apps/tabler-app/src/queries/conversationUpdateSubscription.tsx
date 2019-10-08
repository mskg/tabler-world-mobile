import gql from 'graphql-tag';
import { MemberOverviewFragment } from './MemberOverviewFragment';

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
