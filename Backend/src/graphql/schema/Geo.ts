
import { gql } from 'apollo-server-lambda';

export const Geo = gql`
    extend type Address {
        location: GeoPoint
    }

    extend type Club {
        location: GeoPoint
    }

    input MyCurrentLocationInput {
        longitude: Float!
        latitude: Float!
    }

    input MyLocationInput {
        longitude: Float!
        latitude: Float!
        accuracy: Float!
        speed: Float!
        address: JSON
    }

    input AddressUpdateInput {
        member: Int!
        address: JSON
    }

    extend type Mutation {
        putLocation(location: MyLocationInput!): Boolean
        updateLocationAddress(corrections: [AddressUpdateInput!]!): Boolean
        disableLocationServices: Boolean
    }

    input NearbyMembersQueryInput {
        excludeOwnTable: Boolean
    }

    extend type Query {
        nearbyMembers(location: MyCurrentLocationInput!, query: NearbyMembersQueryInput): [NearbyMember!]
        LocationHistory: [LocationHistory!]
    }

    type GeoPoint {
        longitude: Float!
        latitude: Float!
    }

    enum NearbyMemberState {
        Steady
        Traveling
    }

    type LocationHistory {
        lastseen: Date!

        city: String
        street: String
        country: String

        longitude: Float!
        latitude: Float!
        accuracy: Float!
    }

    type NearbyMember {
        member: Member!
        distance: Int!
        lastseen: Date!
        state: NearbyMemberState!
        address: Address!
    }
`;
