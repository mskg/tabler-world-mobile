import gql from 'graphql-tag';
import { ChatMessageFragment } from './ChatMessageFragment';

export const GetConversationQuery = gql`
    query Conversation($token: String) {
      Conversation(id: "IkNPTlYoOjE6LDoxMDQzMDopIg") {
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
