import gql from 'graphql-tag';
import { MemberFragment } from '../Member/MemberFragment';

export const GetFamilyQuery = gql`
  query Family ($id: ID) {
    Association (id: $id) {
        id

        family {
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

            regionalboard {
                role
                member {
                    ...MemberFragment
                }
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
