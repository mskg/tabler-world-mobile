import gql from 'graphql-tag';
import { MemberFragment } from './MemberFragment';

export const RolesFragment = gql`
    fragment RolesFragment on Club {
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

    ${MemberFragment}
`;
