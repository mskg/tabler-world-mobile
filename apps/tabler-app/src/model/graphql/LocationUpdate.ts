/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RoleType, NearbyMemberState } from "./globalTypes";

// ====================================================
// GraphQL subscription operation: LocationUpdate
// ====================================================

export interface LocationUpdate_locationUpdate_member_club {
  __typename: "Club";
  id: string;
  name: string;
  clubnumber: number;
}

export interface LocationUpdate_locationUpdate_member_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface LocationUpdate_locationUpdate_member_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
}

export interface LocationUpdate_locationUpdate_member_roles_ref {
  __typename: "RoleRef";
  id: string;
  shortname: string;
  type: RoleType;
}

export interface LocationUpdate_locationUpdate_member_roles {
  __typename: "Role";
  name: string;
  level: string;
  group: string;
  ref: LocationUpdate_locationUpdate_member_roles_ref;
}

export interface LocationUpdate_locationUpdate_member {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
  club: LocationUpdate_locationUpdate_member_club;
  area: LocationUpdate_locationUpdate_member_area;
  association: LocationUpdate_locationUpdate_member_association;
  roles: LocationUpdate_locationUpdate_member_roles[] | null;
  availableForChat: boolean | null;
}

export interface LocationUpdate_locationUpdate_location {
  __typename: "GeoPoint";
  longitude: number;
  latitude: number;
}

export interface LocationUpdate_locationUpdate_locationName {
  __typename: "LocationName";
  name: string | null;
  country: string | null;
}

export interface LocationUpdate_locationUpdate {
  __typename: "NearbyMember";
  member: LocationUpdate_locationUpdate_member;
  lastseen: any;
  state: NearbyMemberState;
  distance: number;
  /**
   * Can be null if member does not allow map display
   */
  location: LocationUpdate_locationUpdate_location | null;
  locationName: LocationUpdate_locationUpdate_locationName;
}

export interface LocationUpdate {
  locationUpdate: LocationUpdate_locationUpdate[] | null;
}

export interface LocationUpdateVariables {
  hideOwnTable: boolean;
}
