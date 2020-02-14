import gql from 'graphql-tag';

export const GetAssociationNameQuery = gql`
  query AssociationName ($id: ID) {
    Association (id: $id) {
        id
        name
    }
  }
`;
