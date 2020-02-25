
import { gql } from 'apollo-server-lambda';

// tslint:disable-next-line: variable-name
export const Location = gql`
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
        disableLocationServices: Boolean
    }

    input NearbyMembersQueryInput {
        excludeOwnTable: Boolean
    }

    extend type Query {
        nearbyMembers(location: MyCurrentLocationInput!, query: NearbyMembersQueryInput): [NearbyMember!]
        LocationHistory: [LocationHistory!] @auth(requires: locationhistory)
    }

    type Subscription {
        locationUpdate (location: MyCurrentLocationInput!, query: NearbyMembersQueryInput): [NearbyMember!]
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

        location: GeoPoint
        locationName: LocationName!

        accuracy: Float!
    }

    type LocationName {
        name: String
        country: String
    }

    type NearbyMember {
        member: Member!
        distance: Int!
        lastseen: Date!
        state: NearbyMemberState!

        "Can be null if member does not allow map display"
        location: GeoPoint
        locationName: LocationName!
    }
`;
