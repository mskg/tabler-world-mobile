import gql from 'graphql-tag';

// tslint:disable-next-line: export-name
export const DisableLocationServicesMutation = gql`
    mutation DisableLocationServices {
        putSetting(setting: {
            name: nearbymembers
            value: false
        })

        nearbymembersMap: putSetting(setting: {
            name: nearbymembersMap
            value: false
        })

        disableLocationServices
    }
`;
