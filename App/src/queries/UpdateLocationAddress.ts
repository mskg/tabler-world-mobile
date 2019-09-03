import gql from 'graphql-tag';

export const UpdateLocationAddressMutation = gql`
    mutation UpdateLocationAddress($corrections: [AddressUpdateInput!]!) {
        updateLocationAddress(corrections: $corrections)
    }
`;
