/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: MeFragment
// ====================================================

export interface MeFragment_family {
  __typename: "Family";
  id: string;
  name: string;
}

export interface MeFragment_association {
  __typename: "Association";
  id: string;
  name: string;
}

export interface MeFragment_area {
  __typename: "Area";
  id: string;
  shortname: string;
  name: string;
}

export interface MeFragment_club {
  __typename: "Club";
  id: string;
  clubnumber: number;
  name: string;
}

export interface MeFragment {
  __typename: "Member";
  id: number;
  pic: string | null;
  family: MeFragment_family;
  association: MeFragment_association;
  area: MeFragment_area;
  club: MeFragment_club;
  firstname: string | null;
  lastname: string | null;
}
