import gql from 'graphql-tag';
import { MemberDetailsFragment } from './MemberDetailsFragment';

export const GetMemberQuery = gql`
  query Member($id: Int!) {
    Member(id: $id) {
        ...MemberDetailsFragment
    }
  }

  ${MemberDetailsFragment}
`;
