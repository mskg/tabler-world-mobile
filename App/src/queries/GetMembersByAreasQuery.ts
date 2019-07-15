import gql from 'graphql-tag';
import { MeFragment } from './MeFragment';
import { MemberOverviewFragment } from "./MemberOverviewFragment";

export const GetMembersByAreasQuery = gql`
  query MembersByAreas ($areas: [Int!], $board: Boolean, $areaBoard: Boolean) {
    Me {
       ...MeFragment
    }

    MembersOverview (filter:{areas: $areas, nationalBoard: $board, areaBoard: $areaBoard}) {
        ...MemberOverviewFragment
    }
  }

  ${MemberOverviewFragment}
  ${MeFragment}
`;
