import gql from 'graphql-tag';
import { MemberFragment } from '../Member/MemberFragment';

export const GetFamiliesQuery = gql`
  query Families {
    Me {
        id
        family {
            id
        }
    }

    Families {
      id
      name
      logo

      associations {
        id
        flag
        name
        isocode
      }


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

  ${MemberFragment}
`;

