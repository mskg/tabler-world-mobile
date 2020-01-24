/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: conversationUpdate
// ====================================================

export interface conversationUpdate_conversationUpdate_members_club {
  __typename: "Club";
  id: string;
  name: string;
}

export interface conversationUpdate_conversationUpdate_members_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface conversationUpdate_conversationUpdate_members_association {
  __typename: "Association";
  id: string;
  name: string;
}

export interface conversationUpdate_conversationUpdate_members {
  __typename: "Member";
  id: number;
  firstname: string | null;
  lastname: string | null;
  pic: string | null;
  club: conversationUpdate_conversationUpdate_members_club;
  area: conversationUpdate_conversationUpdate_members_area;
  association: conversationUpdate_conversationUpdate_members_association;
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
