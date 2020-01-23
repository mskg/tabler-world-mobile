import gql from 'graphql-tag';
export const SetLocationServicesOnMapMutation = gql`
    mutation SetLocationServicesOnMap($state: SettingValue!) {
        putSetting(setting: {
            name: nearbymembersMap
            value: $state
        })
    }
`;
