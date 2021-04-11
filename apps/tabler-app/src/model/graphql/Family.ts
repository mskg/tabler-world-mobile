/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Family
// ====================================================

export interface Family_Family_board_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Family_Family_board {
  __typename: "AssociationRole";
  role: string;
  member: Family_Family_board_member;
}

export interface Family_Family_boardassistants_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Family_Family_boardassistants {
  __typename: "AssociationRole";
  role: string;
  member: Family_Family_boardassistants_member;
}

export interface Family_Family_regionalboard_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Family_Family_regionalboard {
  __typename: "AssociationRole";
  role: string;
  member: Family_Family_regionalboard_member;
}

export interface Family_Family {
  __typename: "Family";
  id: string;
  name: string;
  board: Family_Family_board[];
  boardassistants: Family_Family_boardassistants[];
  regionalboard: Family_Family_regionalboard[];
}

export interface Family_Me_family {
  __typename: "Family";
  id: string;
}

export interface Family_Me {
  __typename: "Member";
  family: Family_Me_family;
  id: number;
}

export interface Family {
  Family: Family_Family | null;
  Me: Family_Me;
}

export interface FamilyVariables {
  id?: string | null;
}
