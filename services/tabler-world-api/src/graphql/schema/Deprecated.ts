
import { gql } from 'apollo-server-lambda';

// tslint:disable-next-line: variable-name
export const Deprecated = gql`
    extend type Association {
        "Deprecated, don't use"
        association: String!
    }

    extend type Area {
        "Deprecated, don't use"
        area: Int!
    }

    extend type Club {
        "Deprecated, don't use"
        club: Int!
    }

    extend type Job {
        "Deprecated, don't use"
        success: Boolean!
    }

    extend type NearbyMember {
        "Deprecated, don't use"
        canshowonmap: Boolean!

        "Deprecated, don't use"
        address: Address!
    }

    extend type Mutation {
        "Deprecated, don't use"
        updateLocationAddress(corrections: [AddressUpdateInput!]!): Boolean

        "Deprecated, don't use"
        removeToken(token: String!): Boolean

        "Deprecated, don't use"
        addToken(token: String!): Boolean
    }

    extend type Conversation {
        "Deprecated, don't use"
        members: [Member!]!
    }

    "Deprecated, not longer required"
    input MyCurrentLocationInput {
        longitude: Float!
        latitude: Float!
    }
`;
