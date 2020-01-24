/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Areas
// ====================================================

export interface Areas_Areas_association {
  __typename: "Association";
  name: string;
  id: string;
}

export interface Areas_Areas_board_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Areas_Areas_board {
  __typename: "AssociationRole";
  role: string;
  member: Areas_Areas_board_member;
}

export interface Areas_Areas_clubs {
  __typename: "Club";
  id: string;
  name: string;
  clubnumber: number;
}

export interface Areas_Areas {
  __typename: "Area";
  association: Areas_Areas_association;
  name: string;
  shortname: string;
  id: string;
  board: Areas_Areas_board[];
  clubs: Areas_Areas_clubs[];
}

export interface Areas_Me_area {
  __typename: "Area";
  id: string;
  shortname: string;
}

export interface Areas_Me {
  __typename: "Member";
  area: Areas_Me_area;
  id: number;
}

export interface Areas {
  /**
   * Giving no id returns own organization
   */
  Areas: Areas_Areas[] | null;
  Me: Areas_Me;
}

export interface AreasVariables {
  association?: string | null;
}
