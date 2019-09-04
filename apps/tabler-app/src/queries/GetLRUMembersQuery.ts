import gql from 'graphql-tag';

export const GetLRUMembersQuery = gql`
  query LRUMembers ($ids: [Int!]!) @connection(key: "LRUMembers") {
      Members(ids: $ids) {
          id
          firstname
          lastname
          pic
          club {
              name
          }
      }
  }
`;

