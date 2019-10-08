import gql from 'graphql-tag';
import { ChatMessageFragment } from './ChatMessageFragment';

export const GetConversationQuery = gql`
    query Conversation($id: ID!, $token: String) {
      Conversation(id: $id) {
        id
        messages (token: $token) @connection(key: "messages") {
          nodes {
            ...ChatMessageFragment
          }
          nextToken
        }
      }
    }

    ${ChatMessageFragment}
`;
