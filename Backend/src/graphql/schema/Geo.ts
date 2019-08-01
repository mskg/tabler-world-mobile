
import { gql } from 'apollo-server-lambda';

export const Geo = gql`
    extend type Address {
        longitude: Float
        latitude: Float
    }

    extend type Club {
        longitude: Float
        latitude: Float
    }
`;
