import gql from 'graphql-tag';
import { MemberDetailsFragment } from "./MemberDetailsFragment";

export const GetOfflineMembersQuery = gql`
  query OfflineMembers {
    OwnTable {
        ...MemberDetailsFragment
    }

    FavoriteMembers {
        ...MemberDetailsFragment
    }
  }

  ${MemberDetailsFragment}
`;
