import gql from 'graphql-tag';

export const AddressFragment = gql`
    fragment AddressFragment on Address {
        street1
        street2
        postal_code
        city
    }
`;
