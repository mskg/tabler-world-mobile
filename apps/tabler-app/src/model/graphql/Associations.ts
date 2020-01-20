/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Associations
// ====================================================

export interface Associations_Associations_board_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Associations_Associations_board {
  __typename: "AssociationRole";
  role: string;
  member: Associations_Associations_board_member;
}

export interface Associations_Associations_boardassistants_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Associations_Associations_boardassistants {
  __typename: "AssociationRole";
  role: string;
  member: Associations_Associations_boardassistants_member;
}

export interface Associations_Associations {
  __typename: "Association";
  id: string;
  name: string;
  logo: string | null;
  board: Associations_Associations_board[];
  boardassistants: Associations_Associations_boardassistants[];
}

export interface Associations_Me_association {
  __typename: "Association";
  id: string;
}

export interface Associations_Me {
  __typename: "Member";
  association: Associations_Me_association;
  id: number;
}

export interface Associations {
  Associations: Associations_Associations[] | null;
  Me: Associations_Me;
}

export interface AssociationsVariables {
  id?: string | null;
}
