import gql from 'graphql-tag';
import { NearbyMemberFragment } from './NearbyMemberFragment';

export const LocationUpdateSubscription = gql`
	subscription LocationUpdate ($hideOwnTable: Boolean!) {
		locationUpdate (query: { excludeOwnTable: $hideOwnTable}) @connection(key: "nearbyMembers") {
            ...NearbyMemberFragment
        }
    }

    ${NearbyMemberFragment}
`;
