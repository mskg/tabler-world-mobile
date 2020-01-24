import gql from 'graphql-tag';
import { MemberFragment } from '../Member/MemberFragment';

export const GetAssociationQuery = gql`
  query Association ($id: ID) {
    Association (id: $id) {
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
