/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: LRUMembers
// ====================================================

export interface LRUMembers_Members_club {
  __typename: "Club";
  id: string;
  name: string;
}

export interface LRUMembers_Members {
  __typename: "Member";
  id: number;
  firstname: string | null;
  lastname: string | null;
  pic: string | null;
  club: LRUMembers_Members_club;
}

export interface LRUMembers {
  Members: LRUMembers_Members[] | null;
}

export interface LRUMembersVariables {
  ids: number[];
}
