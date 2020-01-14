/* tslint:disable */
/* eslint-disable */
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
  /**
   * Deprecated, don't use
   */
  association: string;
}

export interface ClubOverviewFragment {
  __typename: "Club";
  id: string;
  name: string;
  clubnumber: number;
  logo: string | null;
  area: ClubOverviewFragment_area;
  association: ClubOverviewFragment_association;
}
