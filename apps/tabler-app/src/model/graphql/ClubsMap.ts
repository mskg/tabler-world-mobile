/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ClubsMap
// ====================================================

export interface ClubsMap_Clubs_meetingplace1 {
  __typename: "Address";
  street1: string | null;
  street2: string | null;
  postal_code: string | null;
  city: string | null;
}

export interface ClubsMap_Clubs_meetingplace2 {
  __typename: "Address";
  street1: string | null;
  street2: string | null;
  postal_code: string | null;
  city: string | null;
}

export interface ClubsMap_Clubs_info {
  __typename: "ClubInfo";
  first_meeting: string | null;
  second_meeting: string | null;
}

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
  meetingplace1: ClubsMap_Clubs_meetingplace1 | null;
  meetingplace2: ClubsMap_Clubs_meetingplace2 | null;
  info: ClubsMap_Clubs_info | null;
  location: ClubsMap_Clubs_location | null;
}

export interface ClubsMap {
  /**
   * Giving no id returns own organization
   */
  Clubs: ClubsMap_Clubs[] | null;
}
