/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: AreasAndClubsFilters
// ====================================================

export interface AreasAndClubsFilters_Areas {
  __typename: "Area";
  id: string;
  name: string;
  shortname: string;
}

export interface AreasAndClubsFilters_Clubs_area {
  __typename: "Area";
  id: string;
}

export interface AreasAndClubsFilters_Clubs {
  __typename: "Club";
  id: string;
  name: string;
  area: AreasAndClubsFilters_Clubs_area;
}

export interface AreasAndClubsFilters {
  Areas: AreasAndClubsFilters_Areas[] | null;
  Clubs: AreasAndClubsFilters_Clubs[] | null;
}

export interface AreasAndClubsFiltersVariables {
  association: string;
}
