import gql from 'graphql-tag';
import { MemberDetailsFragment } from './MemberDetailsFragment';

export const GetFavoriteMembersQuery = gql`
  query FavoriteMembers {
    FavoriteMembers {
        ...MemberDetailsFragment
    }
  }

  ${MemberDetailsFragment}
`;
