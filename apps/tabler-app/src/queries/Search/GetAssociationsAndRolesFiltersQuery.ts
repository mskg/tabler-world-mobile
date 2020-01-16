import gql from 'graphql-tag';

export const GetAssociationsAndRolesFiltersQuery = gql`
    query AssociationsAndRolesFilters {
        Associations {
            id
            name
        }

        Roles
    }
`;
