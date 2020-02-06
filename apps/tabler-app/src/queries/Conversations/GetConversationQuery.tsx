import gql from 'graphql-tag';
import { ChatMessageFragment } from './ChatMessageFragment';
import { ConversationOverviewFragment } from './ConversationOverviewFragment';

export const GetConversationQuery = gql`
    query Conversation($id: ID!, $token: String, $dontMarkAsRead: Boolean) {
      Conversation (id: $id) {
        ...ConversationOverviewFragment

        messages (token: $token, dontMarkAsRead: $dontMarkAsRead) @connection(key: "messages") {
          nodes {
            ...ChatMessageFragment
          }
          nextToken
        }
      }

      Me {
          id
      }
    }

    ${ChatMessageFragment}
    ${ConversationOverviewFragment}
`;
