import gql from 'graphql-tag';
import { AddressFragment } from '../Member/AddressFragment';

export const GetClubsMapQuery = gql`
  query ClubsMap {
        Clubs {
            id
            name
            logo
            club

            meetingplace1 {
                ...AddressFragment
            }

            meetingplace2 {
                ...AddressFragment
            }

            info {
                first_meeting
                second_meeting
            }

            location {
                longitude
                latitude
            }
        }
  }

  ${AddressFragment}
`;
