/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Families
// ====================================================

export interface Families_Families_associations {
  __typename: "Association";
  id: string;
  flag: string | null;
  name: string;
  isocode: string;
}

export interface Families_Families_board_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Families_Families_board {
  __typename: "AssociationRole";
  role: string;
  member: Families_Families_board_member;
}

export interface Families_Families_boardassistants_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Families_Families_boardassistants {
  __typename: "AssociationRole";
  role: string;
  member: Families_Families_boardassistants_member;
}

export interface Families_Families_regionalboard_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Families_Families_regionalboard {
  __typename: "AssociationRole";
  role: string;
  member: Families_Families_regionalboard_member;
}

export interface Families_Families {
  __typename: "Family";
  id: string;
  name: string;
  logo: string | null;
  associations: Families_Families_associations[];
  board: Families_Families_board[];
  boardassistants: Families_Families_boardassistants[];
  regionalboard: Families_Families_regionalboard[];
}

export interface Families {
  Families: Families_Families[] | null;
}
