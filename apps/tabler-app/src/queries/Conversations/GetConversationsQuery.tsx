import gql from 'graphql-tag';
import { MemberOverviewFragment } from '../Member/MemberOverviewFragment';

export const GetConversationsQuery = gql`
    query GetConversations($token: String) {
        Conversations (token: $token) @connection(key: "Conversations") {
            nodes {
              hasUnreadMessages
              members {
                ...MemberOverviewFragment
              }
              id
            }
            nextToken
        }
    }

    ${MemberOverviewFragment}
`;
