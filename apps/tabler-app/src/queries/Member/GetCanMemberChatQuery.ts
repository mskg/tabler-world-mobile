import gql from 'graphql-tag';

export const GetCanMemberChatQuery = gql`
  query CanMemberChat($id: Int!) {
    Member(id: $id) {
        id
        availableForChat
    }
  }
`;
