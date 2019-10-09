import gql from 'graphql-tag';

export const GetConversationStatusQuery = gql`
    query ConversationStatus($id: ID!) {
      Conversation(id: $id) {
        id
        hasUnreadMessages
      }
    }
`;
