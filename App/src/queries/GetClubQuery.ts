import gql from 'graphql-tag';
import { AddressFragment } from './AddressFragment';
import { ClubOverviewFragment } from "./ClubOverviewFragment";
import { MemberFragment } from './MemberFragment';
import { RolesFragment } from './RolesFragment';

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
        }

        meetingplace2 {
            ...AddressFragment
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
