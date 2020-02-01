import gql from 'graphql-tag';

export const GetAssociationsQuery = gql`
    query Assocations {
        Associations {
            id
            name
            flag
        }
    }
`;
