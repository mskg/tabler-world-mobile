/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetConversations
// ====================================================

export interface GetConversations_Conversations_nodes_members_club {
  __typename: "Club";
  id: string;
  name: string;
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

export interface GetConversations_Conversations_nodes_members {
  __typename: "Member";
  id: number;
  firstname: string | null;
  lastname: string | null;
  pic: string | null;
  club: GetConversations_Conversations_nodes_members_club;
  area: GetConversations_Conversations_nodes_members_area;
  association: GetConversations_Conversations_nodes_members_association;
}

export interface GetConversations_Conversations_nodes {
  __typename: "Conversation";
  id: string;
  hasUnreadMessages: boolean;
  members: GetConversations_Conversations_nodes_members[];
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
