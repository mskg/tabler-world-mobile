import gql from 'graphql-tag';

export const GetMeAnFamiliesFilterQuery = gql`
    query MeAnFamiliesFilter {
        Me {
            id

            family {
                id
            }

            association {
                id
            }
        }

        Families {
            id
            name
        }
    }
`;
