import gql from 'graphql-tag';
import { MemberFragment } from '../Member/MemberFragment';

export const GetFamilyQuery = gql`
  query Family ($id: ID) {
    Family (id: $id) {
        id
        name

        board {
            role
            member {
                ...MemberFragment
            }
        }

        boardassistants {
            role
            member {
                ...MemberFragment
            }
        }

        regionalboard {
            role
            member {
                ...MemberFragment
            }
        }
    }

    Me {
        family {
            id
        }

        id
    }
  }

  ${MemberFragment}
`;
