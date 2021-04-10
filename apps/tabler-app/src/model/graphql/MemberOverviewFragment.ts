/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RoleType } from "./globalTypes";

// ====================================================
// GraphQL fragment: MemberOverviewFragment
// ====================================================

export interface MemberOverviewFragment_family {
  __typename: "Family";
  id: string;
  name: string;
}

export interface MemberOverviewFragment_club {
  __typename: "Club";
  id: string;
  name: string;
  clubnumber: number;
}

export interface MemberOverviewFragment_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface MemberOverviewFragment_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
}

export interface MemberOverviewFragment_roles_ref {
  __typename: "RoleRef";
  id: string;
  shortname: string;
  type: RoleType;
}

export interface MemberOverviewFragment_roles {
  __typename: "Role";
  name: string;
  level: string;
  group: string;
  ref: MemberOverviewFragment_roles_ref;
}

export interface MemberOverviewFragment {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
  family: MemberOverviewFragment_family;
  club: MemberOverviewFragment_club;
  area: MemberOverviewFragment_area;
  association: MemberOverviewFragment_association;
  roles: MemberOverviewFragment_roles[] | null;
}
