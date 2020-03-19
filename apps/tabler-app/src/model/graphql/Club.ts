/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Club
// ====================================================

export interface Club_Club_area {
  __typename: "Area";
  id: string;
  name: string;
  shortname: string;
}

export interface Club_Club_association {
  __typename: "Association";
  name: string;
  id: string;
  /**
   * Deprecated, don't use
   */
  association: string;
}

export interface Club_Club_info {
  __typename: "ClubInfo";
  second_meeting: string | null;
  first_meeting: string | null;
  charter_date: any | null;
  national_godparent: string | null;
  international_godparent: string | null;
}

export interface Club_Club_meetingplace1_location {
  __typename: "GeoPoint";
  longitude: number;
  latitude: number;
}

export interface Club_Club_meetingplace1 {
  __typename: "Address";
  street1: string | null;
  street2: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  location: Club_Club_meetingplace1_location | null;
}

export interface Club_Club_meetingplace2_location {
  __typename: "GeoPoint";
  longitude: number;
  latitude: number;
}

export interface Club_Club_meetingplace2 {
  __typename: "Address";
  street1: string | null;
  street2: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  location: Club_Club_meetingplace2_location | null;
}

export interface Club_Club_account {
  __typename: "BankAccount";
  name: string | null;
  owner: string | null;
  iban: string | null;
  bic: string | null;
  currency: string | null;
}

export interface Club_Club_board_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Club_Club_board {
  __typename: "AssociationRole";
  role: string;
  member: Club_Club_board_member;
}

export interface Club_Club_boardassistants_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Club_Club_boardassistants {
  __typename: "AssociationRole";
  role: string;
  member: Club_Club_boardassistants_member;
}

export interface Club_Club_members {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Club_Club {
  __typename: "Club";
  id: string;
  name: string;
  clubnumber: number;
  logo: string | null;
  area: Club_Club_area;
  association: Club_Club_association;
  LastSync: number;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  info: Club_Club_info | null;
  meetingplace1: Club_Club_meetingplace1 | null;
  meetingplace2: Club_Club_meetingplace2 | null;
  account: Club_Club_account | null;
  board: Club_Club_board[];
  boardassistants: Club_Club_boardassistants[] | null;
  members: Club_Club_members[] | null;
}

export interface Club {
  Club: Club_Club | null;
}

export interface ClubVariables {
  id: string;
}
