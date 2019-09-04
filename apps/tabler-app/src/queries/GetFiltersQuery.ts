import gql from 'graphql-tag';

export const GetFiltersQuery = gql`
    query Filters {
        Areas {
            id
            name
        }

        Clubs {
            id
            name
        }

        Roles
    }
`;
