import gql from 'graphql-tag';
import { MemberFragment } from './MemberFragment';

export const GetAreasQuery = gql`
  query Areas {
    Areas {
        association {
            name
            association
        }

        name
        area
        id

        board {
            role
            member {
                ...MemberFragment
            }
        }

        clubs {
            id
            name
            club
        }
    }

    Me {
        area {
            id
            area
        }

        id
    }
  }

  ${MemberFragment}
`;
