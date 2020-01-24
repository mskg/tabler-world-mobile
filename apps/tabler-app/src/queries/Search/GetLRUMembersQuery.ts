import gql from 'graphql-tag';

export const GetLRUMembersQuery = gql`
  query LRUMembers ($ids: [Int!]!) {
      Members(ids: $ids) @connection(key: "LRUMembers") {
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

