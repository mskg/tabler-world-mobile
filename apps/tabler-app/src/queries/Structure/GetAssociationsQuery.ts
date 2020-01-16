import gql from 'graphql-tag';
import { MemberFragment } from '../Member/MemberFragment';

export const GetAssociationsQuery = gql`
  query Associations {
    Associations {
        id
        name
        logo

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
    }

    Me {
        association {
            id
        }

        id
    }
  }

  ${MemberFragment}
`;
