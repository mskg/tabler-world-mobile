import gql from 'graphql-tag';
import { NearbyMemberFragment } from './NearbyMemberFragment';

export const GetNearbyMembersQuery = gql`
    query NearbyMembers($location: MyCurrentLocationInput!, $hideOwnTable: Boolean!) {
        nearbyMembers(location: $location, query: { excludeOwnTable: $hideOwnTable}) @connection(key: "nearbyMembers") {
            ...NearbyMemberFragment
        }
  }

  ${NearbyMemberFragment}
`;
