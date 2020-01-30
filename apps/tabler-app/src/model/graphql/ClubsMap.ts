/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ClubsMap
// ====================================================

export interface ClubsMap_Clubs_location {
  __typename: "GeoPoint";
  longitude: number;
  latitude: number;
}

export interface ClubsMap_Clubs {
  __typename: "Club";
  id: string;
  name: string;
  logo: string | null;
  clubnumber: number;
  location: ClubsMap_Clubs_location | null;
}

export interface ClubsMap {
  /**
   * Giving no id returns own organization
   */
  Clubs: ClubsMap_Clubs[] | null;
}

export interface ClubsMapVariables {
  association?: string | null;
}
