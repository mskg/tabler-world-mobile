import gql from 'graphql-tag';

export const PutLocationMutation = gql`
    mutation PutLocation($location: MyLocationInput!) {
        putLocation(location: $location)
    }
`;

