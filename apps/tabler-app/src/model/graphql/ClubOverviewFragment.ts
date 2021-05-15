/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ClubOverviewFragment
// ====================================================

export interface ClubOverviewFragment_area {
  __typename: "Area";
  id: string;
  name: string;
  shortname: string;
}

export interface ClubOverviewFragment_association {
  __typename: "Association";
  name: string;
  id: string;
  /**
   * Deprecated, don't use
   */
  association: string;
}

export interface ClubOverviewFragment_family {
  __typename: "Family";
  id: string;
  name: string;
}

export interface ClubOverviewFragment {
  __typename: "Club";
  id: string;
  name: string;
  displayname: string;
  clubnumber: number;
  logo: string | null;
  area: ClubOverviewFragment_area;
  association: ClubOverviewFragment_association;
  family: ClubOverviewFragment_family;
}
