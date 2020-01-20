import gql from 'graphql-tag';
import { MemberFragment } from '../Member/MemberFragment';

export const GetAreasQuery = gql`
  query Areas ($association: ID) {
    Areas (association: $association) {
        association {
            name
            id
        }

        name
        shortname
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
            clubnumber
        }
    }

    Me {
        area {
            id
            shortname
        }

        id
    }
  }

  ${MemberFragment}
`;
