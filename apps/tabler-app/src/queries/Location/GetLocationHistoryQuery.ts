import gql from 'graphql-tag';

export const GetLocationHistoryQuery = gql`
    query GetLocationHistory {
        LocationHistory {
            lastseen
            city
            street
            country
            latitude
            longitude
            accuracy
        }
    }
`;
