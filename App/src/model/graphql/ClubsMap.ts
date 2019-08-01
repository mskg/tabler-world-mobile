/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ClubsMap
// ====================================================

export interface ClubsMap_Clubs {
  __typename: "Club";
  id: string;
  name: string;
  logo: string | null;
  longitude: number | null;
  latitude: number | null;
}

export interface ClubsMap {
  Clubs: ClubsMap_Clubs[] | null;
}
