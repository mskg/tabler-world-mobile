/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Clubs
// ====================================================

export interface Clubs_Clubs_area {
  __typename: "Area";
  id: string;
  name: string;
  shortname: string;
}

export interface Clubs_Clubs_association {
  __typename: "Association";
  name: string;
  /**
   * Deprecated, don't use
   */
  association: string;
}

export interface Clubs_Clubs {
  __typename: "Club";
  id: string;
  name: string;
  clubnumber: number;
  logo: string | null;
  area: Clubs_Clubs_area;
  association: Clubs_Clubs_association;
}

export interface Clubs_Me_club {
  __typename: "Club";
  id: string;
  name: string;
  clubnumber: number;
}

export interface Clubs_Me {
  __typename: "Member";
  id: number;
  club: Clubs_Me_club;
}

export interface Clubs {
  Clubs: Clubs_Clubs[] | null;
  Me: Clubs_Me;
}
