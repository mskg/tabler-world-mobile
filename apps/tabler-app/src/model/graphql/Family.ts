/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Family
// ====================================================

export interface Family_Association_family_board_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Family_Association_family_board {
  __typename: "AssociationRole";
  role: string;
  member: Family_Association_family_board_member;
}

export interface Family_Association_family_boardassistants_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Family_Association_family_boardassistants {
  __typename: "AssociationRole";
  role: string;
  member: Family_Association_family_boardassistants_member;
}

export interface Family_Association_family_regionalboard_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Family_Association_family_regionalboard {
  __typename: "AssociationRole";
  role: string;
  member: Family_Association_family_regionalboard_member;
}

export interface Family_Association_family {
  __typename: "Family";
  id: string;
  name: string;
  logo: string | null;
  board: Family_Association_family_board[];
  boardassistants: Family_Association_family_boardassistants[];
  regionalboard: Family_Association_family_regionalboard[];
}

export interface Family_Association {
  __typename: "Association";
  id: string;
  family: Family_Association_family;
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
  /**
   * Giving no id returns own organization
   */
  Association: Family_Association | null;
  Me: Family_Me;
}

export interface FamilyVariables {
  id?: string | null;
}
