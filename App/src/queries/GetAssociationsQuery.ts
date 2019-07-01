import gql from 'graphql-tag';
import { MemberFragment } from "./MemberFragment";

export const GetAssociationsQuery = gql`
  query Associations {
    Associations {
        association
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
    }

    Me {
        association {
            association
        }

        id
    }
  }

  ${MemberFragment}
`;
