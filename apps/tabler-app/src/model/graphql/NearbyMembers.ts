/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { MyCurrentLocationInput, RoleType, NearbyMemberState } from "./globalTypes";

// ====================================================
// GraphQL query operation: NearbyMembers
// ====================================================

export interface NearbyMembers_nearbyMembers_member_club {
  __typename: "Club";
  id: string;
  name: string;
  club: number;
}

export interface NearbyMembers_nearbyMembers_member_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface NearbyMembers_nearbyMembers_member_association {
  __typename: "Association";
  association: string;
  name: string;
}

export interface NearbyMembers_nearbyMembers_member_roles_ref {
  __typename: "RoleRef";
  id: string;
  name: string;
  type: RoleType;
}

export interface NearbyMembers_nearbyMembers_member_roles {
  __typename: "Role";
  name: string;
  level: string;
  group: string;
  ref: NearbyMembers_nearbyMembers_member_roles_ref;
}

export interface NearbyMembers_nearbyMembers_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
  club: NearbyMembers_nearbyMembers_member_club;
  area: NearbyMembers_nearbyMembers_member_area;
  association: NearbyMembers_nearbyMembers_member_association;
  roles: NearbyMembers_nearbyMembers_member_roles[] | null;
}

export interface NearbyMembers_nearbyMembers_address_location {
  __typename: "GeoPoint";
  longitude: number;
  latitude: number;
}

export interface NearbyMembers_nearbyMembers_address {
  __typename: "Address";
  location: NearbyMembers_nearbyMembers_address_location | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  region: string | null;
}

export interface NearbyMembers_nearbyMembers {
  __typename: "NearbyMember";
  member: NearbyMembers_nearbyMembers_member;
  lastseen: any;
  state: NearbyMemberState;
  distance: number;
  address: NearbyMembers_nearbyMembers_address;
}

export interface NearbyMembers {
  nearbyMembers: NearbyMembers_nearbyMembers[] | null;
}

export interface NearbyMembersVariables {
  location: MyCurrentLocationInput;
}