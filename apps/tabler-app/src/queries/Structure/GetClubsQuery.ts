import gql from 'graphql-tag';
import { ClubOverviewFragment } from './ClubOverviewFragment';

export const GetClubsQuery = gql`
  query Clubs ($association: ID) {
    Clubs (association: $association) {
        ...ClubOverviewFragment
    }

    Me {
        id
        club {
            id
            name
            clubnumber
        }
    }
  }

  ${ClubOverviewFragment}
`;
