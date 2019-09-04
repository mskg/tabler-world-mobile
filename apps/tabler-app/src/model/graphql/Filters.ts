/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Filters
// ====================================================

export interface Filters_Areas {
  __typename: "Area";
  id: string;
  name: string;
}

export interface Filters_Clubs {
  __typename: "Club";
  id: string;
  name: string;
}

export interface Filters {
  Areas: Filters_Areas[] | null;
  Clubs: Filters_Clubs[] | null;
  Roles: string[] | null;
}
