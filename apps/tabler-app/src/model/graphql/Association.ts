/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Association
// ====================================================

export interface Association_Association_board_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Association_Association_board {
  __typename: "AssociationRole";
  role: string;
  member: Association_Association_board_member;
}

export interface Association_Association_boardassistants_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Association_Association_boardassistants {
  __typename: "AssociationRole";
  role: string;
  member: Association_Association_boardassistants_member;
}

export interface Association_Association {
  __typename: "Association";
  id: string;
  name: string;
  logo: string | null;
  board: Association_Association_board[];
  boardassistants: Association_Association_boardassistants[];
}

export interface Association_Me_association {
  __typename: "Association";
  id: string;
}

export interface Association_Me {
  __typename: "Member";
  association: Association_Me_association;
  id: number;
}

export interface Association {
  /**
   * Giving no id returns own organization
   */
  Association: Association_Association | null;
  Me: Association_Me;
}

export interface AssociationVariables {
  id?: string | null;
}
