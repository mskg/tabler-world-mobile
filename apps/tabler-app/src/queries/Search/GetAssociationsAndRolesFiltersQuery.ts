import gql from 'graphql-tag';

export const GetAssociationsAndRolesFiltersQuery = gql`
    query AssociationsAndRolesFilters {
        Me {
            id

            association {
                id
            }
        }

        Associations {
            id
            name
        }

        Roles
    }
`;
