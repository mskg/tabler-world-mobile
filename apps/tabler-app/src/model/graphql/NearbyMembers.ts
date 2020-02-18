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
  clubnumber: number;
}

export interface NearbyMembers_nearbyMembers_member_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface NearbyMembers_nearbyMembers_member_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
}

export interface NearbyMembers_nearbyMembers_member_roles_ref {
  __typename: "RoleRef";
  id: string;
  shortname: string;
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
  availableForChat: boolean | null;
}

export interface NearbyMembers_nearbyMembers_location {
  __typename: "GeoPoint";
  longitude: number;
  latitude: number;
}

export interface NearbyMembers_nearbyMembers_locationName {
  __typename: "LocationName";
  name: string;
  country: string;
}

export interface NearbyMembers_nearbyMembers {
  __typename: "NearbyMember";
  member: NearbyMembers_nearbyMembers_member;
  lastseen: any;
  state: NearbyMemberState;
  distance: number;
  /**
   * Can be null if member does not allow map display
   */
  location: NearbyMembers_nearbyMembers_location | null;
  locationName: NearbyMembers_nearbyMembers_locationName;
}

export interface NearbyMembers {
  nearbyMembers: NearbyMembers_nearbyMembers[] | null;
}

export interface NearbyMembersVariables {
  location: MyCurrentLocationInput;
  hideOwnTable: boolean;
}
