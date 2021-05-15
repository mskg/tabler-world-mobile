/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RoleType, NearbyMemberState } from "./globalTypes";

// ====================================================
// GraphQL fragment: NearbyMemberFragment
// ====================================================

export interface NearbyMemberFragment_member_family {
  __typename: "Family";
  id: string;
  icon: string | null;
  name: string;
  shortname: string;
}

export interface NearbyMemberFragment_member_club {
  __typename: "Club";
  id: string;
  name: string;
  clubnumber: number;
}

export interface NearbyMemberFragment_member_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface NearbyMemberFragment_member_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
}

export interface NearbyMemberFragment_member_roles_ref {
  __typename: "RoleRef";
  id: string;
  shortname: string;
  type: RoleType;
}

export interface NearbyMemberFragment_member_roles {
  __typename: "Role";
  name: string;
  group: string;
  ref: NearbyMemberFragment_member_roles_ref;
}

export interface NearbyMemberFragment_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
  family: NearbyMemberFragment_member_family;
  club: NearbyMemberFragment_member_club;
  area: NearbyMemberFragment_member_area;
  association: NearbyMemberFragment_member_association;
  roles: NearbyMemberFragment_member_roles[] | null;
  availableForChat: boolean | null;
}

export interface NearbyMemberFragment_location {
  __typename: "GeoPoint";
  longitude: number;
  latitude: number;
}

export interface NearbyMemberFragment_locationName {
  __typename: "LocationName";
  name: string | null;
  country: string | null;
}

export interface NearbyMemberFragment {
  __typename: "NearbyMember";
  member: NearbyMemberFragment_member;
  lastseen: any;
  state: NearbyMemberState;
  distance: number;
  /**
   * Can be null if member does not allow map display
   */
  location: NearbyMemberFragment_location | null;
  locationName: NearbyMemberFragment_locationName;
}
