import gql from 'graphql-tag';

export const PutLocationMutation = gql`
    mutation PutLocation($location: MyLocationInput!) {
        putLocation(location: $location)
    }
`;


export const EnableLocationServicesMutation = gql`
    mutation EnableLocationServices($location: MyLocationInput!) {
        putSetting(setting: {
            name: nearbymembers
            value: true
        })

        putLocation(location: $location)
    }
`;

