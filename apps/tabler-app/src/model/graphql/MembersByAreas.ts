/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RoleType } from "./globalTypes";

// ====================================================
// GraphQL query operation: MembersByAreas
// ====================================================

export interface MembersByAreas_Me_family {
  __typename: "Family";
  id: string;
  name: string;
}

export interface MembersByAreas_Me_association {
  __typename: "Association";
  id: string;
  name: string;
}

export interface MembersByAreas_Me_area {
  __typename: "Area";
  id: string;
  shortname: string;
  name: string;
}

export interface MembersByAreas_Me_club {
  __typename: "Club";
  id: string;
  clubnumber: number;
  name: string;
}

export interface MembersByAreas_Me {
  __typename: "Member";
  id: number;
  pic: string | null;
  family: MembersByAreas_Me_family;
  association: MembersByAreas_Me_association;
  area: MembersByAreas_Me_area;
  club: MembersByAreas_Me_club;
  firstname: string | null;
  lastname: string | null;
}

export interface MembersByAreas_MembersOverview_family {
  __typename: "Family";
  id: string;
  icon: string | null;
  name: string;
  shortname: string;
}

export interface MembersByAreas_MembersOverview_club {
  __typename: "Club";
  id: string;
  name: string;
  clubnumber: number;
}

export interface MembersByAreas_MembersOverview_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface MembersByAreas_MembersOverview_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
}

export interface MembersByAreas_MembersOverview_roles_ref {
  __typename: "RoleRef";
  id: string;
  shortname: string;
  type: RoleType;
}

export interface MembersByAreas_MembersOverview_roles {
  __typename: "Role";
  name: string;
  group: string;
  ref: MembersByAreas_MembersOverview_roles_ref;
}

export interface MembersByAreas_MembersOverview {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
  family: MembersByAreas_MembersOverview_family;
  club: MembersByAreas_MembersOverview_club;
  area: MembersByAreas_MembersOverview_area;
  association: MembersByAreas_MembersOverview_association;
  roles: MembersByAreas_MembersOverview_roles[] | null;
}

export interface MembersByAreas {
  Me: MembersByAreas_Me;
  MembersOverview: MembersByAreas_MembersOverview[];
}

export interface MembersByAreasVariables {
  areas?: string[] | null;
  board?: boolean | null;
  areaBoard?: boolean | null;
}
