import gql from 'graphql-tag';
import { MemberOverviewFragment } from '../../../queries/MemberOverviewFragment';

export const GetConversationsQuery = gql`
    query GetConversations {
        Conversations {
            nodes {
              hasUnreadMessages
              members {
                ...MemberOverviewFragment
              }
              id
            }
        }
    }

    ${MemberOverviewFragment}
`;
