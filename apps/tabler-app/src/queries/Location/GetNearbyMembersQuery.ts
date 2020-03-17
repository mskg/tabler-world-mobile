import gql from 'graphql-tag';
import { NearbyMemberFragment } from './NearbyMemberFragment';

export const GetNearbyMembersQuery = gql`
    query NearbyMembers($hideOwnTable: Boolean!) {
        nearbyMembers(query: { excludeOwnTable: $hideOwnTable}) @connection(key: "nearbyMembers") {
            ...NearbyMemberFragment
        }
  }

  ${NearbyMemberFragment}
`;
