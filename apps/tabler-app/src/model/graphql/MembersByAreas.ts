/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { RoleType } from "./globalTypes";

// ====================================================
// GraphQL query operation: MembersByAreas
// ====================================================

export interface MembersByAreas_Me_association {
  __typename: "Association";
  association: string;
  name: string;
}

export interface MembersByAreas_Me_area {
  __typename: "Area";
  id: string;
  area: number;
  name: string;
}

export interface MembersByAreas_Me_club {
  __typename: "Club";
  id: string;
  club: number;
  name: string;
}

export interface MembersByAreas_Me {
  __typename: "Member";
  id: number;
  pic: string | null;
  association: MembersByAreas_Me_association;
  area: MembersByAreas_Me_area;
  club: MembersByAreas_Me_club;
  firstname: string | null;
  lastname: string | null;
}

export interface MembersByAreas_MembersOverview_club {
  __typename: "Club";
  id: string;
  name: string;
  club: number;
}

export interface MembersByAreas_MembersOverview_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface MembersByAreas_MembersOverview_association {
  __typename: "Association";
  association: string;
  name: string;
}

export interface MembersByAreas_MembersOverview_roles_ref {
  __typename: "RoleRef";
  id: string;
  name: string;
  type: RoleType;
}

export interface MembersByAreas_MembersOverview_roles {
  __typename: "Role";
  name: string;
  level: string;
  group: string;
  ref: MembersByAreas_MembersOverview_roles_ref;
}

export interface MembersByAreas_MembersOverview {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
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
  areas?: number[] | null;
  board?: boolean | null;
  areaBoard?: boolean | null;
}
