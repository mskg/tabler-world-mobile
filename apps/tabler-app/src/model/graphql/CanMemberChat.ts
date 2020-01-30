/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CanMemberChat
// ====================================================

export interface CanMemberChat_Member {
  __typename: "Member";
  id: number;
  availableForChat: boolean | null;
}

export interface CanMemberChat {
  Member: CanMemberChat_Member | null;
}

export interface CanMemberChatVariables {
  id: number;
}
