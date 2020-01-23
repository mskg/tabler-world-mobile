import gql from 'graphql-tag';

export const EnableLocationServicesMutation = gql`
    mutation EnableLocationServices($location: MyLocationInput!) {
        putSetting(setting: {
            name: nearbymembers
            value: true
        })

        nearbymembersMap: putSetting (setting: {
            name: nearbymembersMap
            value: false
        })

        putLocation(location: $location)
    }
`;
