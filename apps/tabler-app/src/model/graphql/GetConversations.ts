/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { RoleType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetConversations
// ====================================================

export interface GetConversations_Conversations_nodes_members_club {
  __typename: "Club";
  id: string;
  name: string;
  club: number;
}

export interface GetConversations_Conversations_nodes_members_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface GetConversations_Conversations_nodes_members_association {
  __typename: "Association";
  association: string;
  name: string;
}

export interface GetConversations_Conversations_nodes_members_roles_ref {
  __typename: "RoleRef";
  id: string;
  name: string;
  type: RoleType;
}

export interface GetConversations_Conversations_nodes_members_roles {
  __typename: "Role";
  name: string;
  level: string;
  group: string;
  ref: GetConversations_Conversations_nodes_members_roles_ref;
}

export interface GetConversations_Conversations_nodes_members {
  __typename: "Member";
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
  club: GetConversations_Conversations_nodes_members_club;
  area: GetConversations_Conversations_nodes_members_area;
  association: GetConversations_Conversations_nodes_members_association;
  roles: GetConversations_Conversations_nodes_members_roles[] | null;
}

export interface GetConversations_Conversations_nodes {
  __typename: "Conversation";
  hasUnreadMessages: boolean;
  members: GetConversations_Conversations_nodes_members[];
  id: string;
}

export interface GetConversations_Conversations {
  __typename: "ConversationIterator";
  nodes: GetConversations_Conversations_nodes[];
  nextToken: string | null;
}

export interface GetConversations {
  Conversations: GetConversations_Conversations;
}

export interface GetConversationsVariables {
  token?: string | null;
}
