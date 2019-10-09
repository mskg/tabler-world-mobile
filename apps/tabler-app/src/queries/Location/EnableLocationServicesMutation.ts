import gql from 'graphql-tag';
export const EnableLocationServicesMutation = gql`
    mutation EnableLocationServices($location: MyLocationInput!) {
        putSetting(setting: {
            name: nearbymembers
            value: true
        })

        putLocation(location: $location)
    }
`;
