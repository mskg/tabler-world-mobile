/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetConversations
// ====================================================

export interface GetConversations_Conversations_nodes_participants_member_club {
  __typename: "Club";
  id: string;
  name: string;
}

export interface GetConversations_Conversations_nodes_participants_member_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface GetConversations_Conversations_nodes_participants_member_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
}

export interface GetConversations_Conversations_nodes_participants_member {
  __typename: "Member";
  id: number;
  firstname: string | null;
  lastname: string | null;
  pic: string | null;
  club: GetConversations_Conversations_nodes_participants_member_club;
  area: GetConversations_Conversations_nodes_participants_member_area;
  association: GetConversations_Conversations_nodes_participants_member_association;
}

export interface GetConversations_Conversations_nodes_participants {
  __typename: "ConversationParticipant";
  id: string;
  iscallingidentity: boolean;
  firstname: string | null;
  lastname: string | null;
  /**
   * Can be archived ore removed already
   */
  member: GetConversations_Conversations_nodes_participants_member | null;
}

export interface GetConversations_Conversations_nodes {
  __typename: "Conversation";
  id: string;
  hasUnreadMessages: boolean;
  subject: string;
  pic: string | null;
  participants: GetConversations_Conversations_nodes_participants[];
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
