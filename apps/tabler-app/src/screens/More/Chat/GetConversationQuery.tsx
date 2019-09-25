import gql from 'graphql-tag';

export const GetConversationQuery = gql`

    query Conversation($token: String) {
      Conversation(id: "IkNPTlYoOjE6LDoxMDQzMDopIg") {
        messages (token: $token) @connection(key: "messages") {
          nodes {
            id
            payload
            senderId
            createdAt
          }
          nextToken
        }
      }
    }
`;
