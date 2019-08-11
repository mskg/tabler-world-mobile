
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
        accuracy: Int!
        speed: Float!
        address: JSON
    }

    extend type Mutation {
        putLocation(location: MyLocationInput!): Boolean
        disableLocationServices: Boolean
    }

    input NearbyMembersQueryInput {
        excludeOwnTable: Boolean
    }

    extend type Query {
        nearbyMembers(location: MyCurrentLocationInput!, query: NearbyMembersQueryInput): [NearbyMember!]
    }

    type GeoPoint {
        longitude: Float!
        latitude: Float!
    }

    enum NearbyMemberState {
        Steady
        Traveling
    }

    type NearbyMember {
        member: Member!
        distance: Int!
        lastseen: Date!
        state: NearbyMemberState!
        address: Address!
    }
`;
