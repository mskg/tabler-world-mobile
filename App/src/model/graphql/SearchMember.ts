/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { RoleType } from "./globalTypes";

// ====================================================
// GraphQL query operation: SearchMember
// ====================================================

export interface SearchMember_SearchMember_nodes_club {
  __typename: "Club";
  id: string;
  name: string;
  club: number;
}

export interface SearchMember_SearchMember_nodes_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface SearchMember_SearchMember_nodes_association {
  __typename: "Association";
  association: string;
  name: string;
}

export interface SearchMember_SearchMember_nodes_roles_ref {
  __typename: "RoleRef";
  id: string;
  name: string;
  type: RoleType;
}

export interface SearchMember_SearchMember_nodes_roles {
  __typename: "Role";
  name: string;
  level: string;
  group: string;
  ref: SearchMember_SearchMember_nodes_roles_ref;
}

export interface SearchMember_SearchMember_nodes {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
  club: SearchMember_SearchMember_nodes_club;
  area: SearchMember_SearchMember_nodes_area;
  association: SearchMember_SearchMember_nodes_association;
  roles: SearchMember_SearchMember_nodes_roles[] | null;
}

export interface SearchMember_SearchMember_pageInfo {
  __typename: "PageInfo";
  endCursor: string;
  hasNextPage: boolean;
}

export interface SearchMember_SearchMember {
  __typename: "SearchMemberConnection";
  nodes: SearchMember_SearchMember_nodes[];
  pageInfo: SearchMember_SearchMember_pageInfo;
}

export interface SearchMember {
  SearchMember: SearchMember_SearchMember;
}

export interface SearchMemberVariables {
  text: string;
  after?: string | null;
  areas?: string[] | null;
  roles?: string[] | null;
  clubs?: string[] | null;
}
