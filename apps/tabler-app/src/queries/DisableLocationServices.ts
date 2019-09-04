import gql from 'graphql-tag';

export const DisableLocationServicesMutation = gql`
    mutation DisableLocationServices {
        putSetting(setting: {
            name: nearbymembers
            value: false
        })

        disableLocationServices
    }
`;
