import gql from 'graphql-tag';

export const EnableLocationServicesMutation = gql`
    mutation EnableLocationServices($location: MyLocationInput!, $map: SettingValue!) {
        putSetting(setting: {
            name: nearbymembers
            value: true
        })

        nearbymembersMap: putSetting (setting: {
            name: nearbymembersMap
            value: $map
        })

        putLocation(location: $location)
    }
`;
