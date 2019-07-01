import gql from 'graphql-tag';
import { MeFragment } from './MeFragment';
import { MemberOverviewFragment } from "./MemberOverviewFragment";

export const GetMembersByAreasQuery = gql`
  query MembersByAreas ($areas: [Int!]) {
    Me {
       ...MeFragment
    }

    MembersOverview (filter:{areas: $areas}) {
        ...MemberOverviewFragment
    }
  }

  ${MemberOverviewFragment}
  ${MeFragment}
`;
