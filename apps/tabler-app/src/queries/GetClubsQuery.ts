import gql from 'graphql-tag';
import { ClubOverviewFragment } from './ClubOverviewFragment';

export const GetClubsQuery = gql`
  query Clubs {
    Clubs {
        ...ClubOverviewFragment
    }

    Me {
        id
        club {
            id
            name
            club
        }
    }
  }

  ${ClubOverviewFragment}
`;
