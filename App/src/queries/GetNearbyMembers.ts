import gql from 'graphql-tag';
import { MemberOverviewFragment } from "./MemberOverviewFragment";

export const GetNearbyMembersQuery = gql`
    query NearbyMembers($location: MyCurrentLocationInput!) {
        nearbyMembers(location: $location) @connection(key: "nearbyMembers") {
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