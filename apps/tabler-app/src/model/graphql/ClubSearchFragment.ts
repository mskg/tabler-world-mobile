/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ClubSearchFragment
// ====================================================

export interface ClubSearchFragment_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
}

export interface ClubSearchFragment_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface ClubSearchFragment_family {
  __typename: "Family";
  id: string;
  name: string;
  shortname: string;
}

export interface ClubSearchFragment {
  __typename: "Club";
  id: string;
  name: string;
  logo: string | null;
  clubnumber: number;
  association: ClubSearchFragment_association;
  area: ClubSearchFragment_area;
  family: ClubSearchFragment_family;
}
