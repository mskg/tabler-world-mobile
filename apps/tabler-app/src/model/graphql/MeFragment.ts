/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: MeFragment
// ====================================================

export interface MeFragment_association {
  __typename: "Association";
  association: string;
  name: string;
}

export interface MeFragment_area {
  __typename: "Area";
  id: string;
  area: number;
  name: string;
}

export interface MeFragment_club {
  __typename: "Club";
  id: string;
  club: number;
  name: string;
}

export interface MeFragment {
  __typename: "Member";
  id: number;
  pic: string | null;
  association: MeFragment_association;
  area: MeFragment_area;
  club: MeFragment_club;
  firstname: string | null;
  lastname: string | null;
}
