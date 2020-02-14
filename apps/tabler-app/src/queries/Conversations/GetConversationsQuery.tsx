import gql from 'graphql-tag';
import { ConversationOverviewFragment } from './ConversationOverviewFragment';

export const GetConversationsQuery = gql`
    query GetConversations($token: String) {
        Conversations (token: $token) @connection(key: "Conversations") {
            nodes {
              ...ConversationOverviewFragment
            }
            nextToken
        }
    }

    ${ConversationOverviewFragment}
`;
