import gql from 'graphql-tag';
import { ChatMessageFragment } from './ChatMessageFragment';
import { MemberAvatarFragment } from './MemberAvatarFragment';

export const GetConversationQuery = gql`
    query Conversation($id: ID!, $token: String) {
      Conversation (id: $id) {
        id
        members {
            ...MemberAvatarFragment
        }
        messages (token: $token) @connection(key: "messages") {
          nodes {
            ...ChatMessageFragment
          }
          nextToken
        }
      }
    }

    ${ChatMessageFragment}
    ${MemberAvatarFragment}
`;
