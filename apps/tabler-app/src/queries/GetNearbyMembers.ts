import gql from 'graphql-tag';
import { MemberOverviewFragment } from './MemberOverviewFragment';

export const GetNearbyMembersQuery = gql`
    query NearbyMembers($location: MyCurrentLocationInput!, $hideOwnTable: Boolean!) {
        nearbyMembers(location: $location, query: { excludeOwnTable: $hideOwnTable}) @connection(key: "nearbyMembers") {
            member {
                ...MemberOverviewFragment
            }

            lastseen
            state
            distance

            address {
                location {
                    longitude
                    latitude
                }

                postal_code
                city
                country
                region
            }
        }
  }

  ${MemberOverviewFragment}
`;