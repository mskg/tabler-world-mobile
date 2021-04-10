/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Roles
// ====================================================

export interface Roles_Club_board_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Roles_Club_board {
  __typename: "AssociationRole";
  role: string;
  member: Roles_Club_board_member;
}

export interface Roles_Club_boardassistants_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Roles_Club_boardassistants {
  __typename: "AssociationRole";
  role: string;
  member: Roles_Club_boardassistants_member;
}

export interface Roles_Club {
  __typename: "Club";
  LastSync: number;
  id: string;
  board: Roles_Club_board[];
  boardassistants: Roles_Club_boardassistants[];
}

export interface Roles {
  Club: Roles_Club | null;
}

export interface RolesVariables {
  id: string;
}
