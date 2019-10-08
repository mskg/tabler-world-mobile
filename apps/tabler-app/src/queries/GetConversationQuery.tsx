import gql from 'graphql-tag';
import { ChatMessageFragment } from './ChatMessageFragment';

export const GetConversationQuery = gql`
    query Conversation($id: ID!, $token: String) {
      Conversation (id: $id) {
        id
        members {
            id
            lastname
            firstname
            pic
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
`;
