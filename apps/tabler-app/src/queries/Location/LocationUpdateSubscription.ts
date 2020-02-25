import gql from 'graphql-tag';
import { NearbyMemberFragment } from './NearbyMemberFragment';

export const LocationUpdateSubscription = gql`
	subscription LocationUpdate ($location: MyCurrentLocationInput!, $hideOwnTable: Boolean!) {
		locationUpdate (location: $location, query: { excludeOwnTable: $hideOwnTable}) @connection(key: "nearbyMembers") {
            ...NearbyMemberFragment
        }
    }

    ${NearbyMemberFragment}
`;
