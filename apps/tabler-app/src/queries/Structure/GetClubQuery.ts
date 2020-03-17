import gql from 'graphql-tag';
import { AddressFragment } from '../Member/AddressFragment';
import { MemberFragment } from '../Member/MemberFragment';
import { RolesFragment } from '../Member/RolesFragment';
import { ClubOverviewFragment } from './ClubOverviewFragment';

export const GetClubQuery = gql`
  query Club($id: String!) {
    Club(id: $id) {
        ...ClubOverviewFragment

        LastSync @client

        website
        facebook
        instagram
        twitter

        info {
            second_meeting
            first_meeting
            charter_date
            national_godparent
            international_godparent
        }

        meetingplace1 {
            ...AddressFragment
            location {
                longitude
                latitude
            }
        }

        meetingplace2 {
            ...AddressFragment
            location {
                longitude
                latitude
            }
        }

        account {
            name
            owner
            iban
            bic
            currency
        }

        ...RolesFragment

        members {
            ...MemberFragment
        }
    }
  }

  ${ClubOverviewFragment}
  ${AddressFragment}
  ${MemberFragment}
  ${RolesFragment}
`;
