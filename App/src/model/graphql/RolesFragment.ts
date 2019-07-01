/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: RolesFragment
// ====================================================

export interface RolesFragment_board_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface RolesFragment_board {
  __typename: "AssociationRole";
  role: string;
  member: RolesFragment_board_member;
}

export interface RolesFragment_boardassistants_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface RolesFragment_boardassistants {
  __typename: "AssociationRole";
  role: string;
  member: RolesFragment_boardassistants_member;
}

export interface RolesFragment {
  __typename: "Club";
  board: RolesFragment_board[];
  boardassistants: RolesFragment_boardassistants[] | null;
}
