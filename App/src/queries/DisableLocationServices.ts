import gql from 'graphql-tag';

export const DisableLocationServicesMutation = gql`
    mutation DisableLocationServices {
        disableLocationServices
    }
`;
