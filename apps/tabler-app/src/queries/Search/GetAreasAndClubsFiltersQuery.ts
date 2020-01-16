import gql from 'graphql-tag';

export const GetAreasAndClubsFiltersQuery = gql`
    query AreasAndClubsFilters ($association: String!) {
        Areas (association: $association) {
            id
            name
            shortname
        }

        Clubs (association: $association) {
            id
            name

            area {
                id
            }
        }
    }
`;
