import gql from 'graphql-tag';
import { MemberAvatarFragment } from './MemberAvatarFragment';

export const GetConversationsQuery = gql`
    query GetConversations($token: String) {
        Conversations (token: $token) @connection(key: "Conversations") {
            nodes {
              id
              hasUnreadMessages
              members {
                ...MemberAvatarFragment
              }
            }
            nextToken
        }
    }

    ${MemberAvatarFragment}
`;
