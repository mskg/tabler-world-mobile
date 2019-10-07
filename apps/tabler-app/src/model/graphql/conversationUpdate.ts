/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { RoleType } from "./globalTypes";

// ====================================================
// GraphQL subscription operation: conversationUpdate
// ====================================================

export interface conversationUpdate_conversationUpdate_members_club {
  __typename: "Club";
  id: string;
  name: string;
  club: number;
}

export interface conversationUpdate_conversationUpdate_members_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface conversationUpdate_conversationUpdate_members_association {
  __typename: "Association";
  association: string;
  name: string;
}

export interface conversationUpdate_conversationUpdate_members_roles_ref {
  __typename: "RoleRef";
  id: string;
  name: string;
  type: RoleType;
}

export interface conversationUpdate_conversationUpdate_members_roles {
  __typename: "Role";
  name: string;
  level: string;
  group: string;
  ref: conversationUpdate_conversationUpdate_members_roles_ref;
}

export interface conversationUpdate_conversationUpdate_members {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
  club: conversationUpdate_conversationUpdate_members_club;
  area: conversationUpdate_conversationUpdate_members_area;
  association: conversationUpdate_conversationUpdate_members_association;
  roles: conversationUpdate_conversationUpdate_members_roles[] | null;
}

export interface conversationUpdate_conversationUpdate {
  __typename: "Conversation";
  hasUnreadMessages: boolean;
  members: conversationUpdate_conversationUpdate_members[];
  id: string;
}

export interface conversationUpdate {
  conversationUpdate: conversationUpdate_conversationUpdate;
}
