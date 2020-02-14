import gql from 'graphql-tag';

// tslint:disable-next-line: export-name
export const DisableLocationServicesMutation = gql`
    mutation DisableLocationServices ($nearby: SettingValue!, $map: SettingValue!) {
        putSetting(setting: {
            name: nearbymembers
            value: $nearby
        })

        nearbymembersMap: putSetting(setting: {
            name: nearbymembersMap
            value: $map
        })

        disableLocationServices
    }
`;
