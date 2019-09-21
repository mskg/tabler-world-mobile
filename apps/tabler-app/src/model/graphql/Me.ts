/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Me
// ====================================================

export interface Me_Me_association {
  __typename: "Association";
  association: string;
  name: string;
}

export interface Me_Me_area {
  __typename: "Area";
  id: string;
  area: number;
  name: string;
}

export interface Me_Me_club {
  __typename: "Club";
  id: string;
  club: number;
  name: string;
}

export interface Me_Me {
  __typename: "Member";
  id: number;
  pic: string | null;
  association: Me_Me_association;
  area: Me_Me_area;
  club: Me_Me_club;
  firstname: string | null;
  lastname: string | null;
}

export interface Me {
  Me: Me_Me;
}
