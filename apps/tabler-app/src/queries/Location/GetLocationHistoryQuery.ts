import gql from 'graphql-tag';

export const GetLocationHistoryQuery = gql`
    query GetLocationHistory {
        LocationHistory {
            lastseen
            accuracy

            location {
                longitude
                latitude
            }

            locationName {
                name
                country
            }
        }
    }
`;
