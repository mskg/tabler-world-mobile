import gql from 'graphql-tag';

export const GetMyRolesQuery = gql`
    query GetMyRoles {
        MyRoles
    }
`;
