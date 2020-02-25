import gql from 'graphql-tag';
import { MemberOverviewFragment } from '../Member/MemberOverviewFragment';

export const NearbyMemberFragment = gql`
    fragment NearbyMemberFragment on NearbyMember {
        member {
                ...MemberOverviewFragment
                availableForChat
            }

            lastseen
            state
            distance

            location {
                longitude
                latitude
            }

            locationName {
                name
                country
            }
    }

    ${MemberOverviewFragment}
`;
