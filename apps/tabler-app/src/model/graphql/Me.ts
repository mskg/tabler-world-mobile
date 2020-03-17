/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Me
// ====================================================

export interface Me_Me_association {
  __typename: "Association";
  id: string;
  name: string;
}

export interface Me_Me_area {
  __typename: "Area";
  id: string;
  shortname: string;
  name: string;
}

export interface Me_Me_club {
  __typename: "Club";
  id: string;
  clubnumber: number;
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
