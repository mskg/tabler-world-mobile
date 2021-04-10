import gql from 'graphql-tag';

export const GetAssociationsAndRolesFiltersQuery = gql`
    query AssociationsAndRolesFilters ($family: ID!) {
        Associations (family: $family) {
            id
            name
        }

        Roles (family: $family)
    }
`;
