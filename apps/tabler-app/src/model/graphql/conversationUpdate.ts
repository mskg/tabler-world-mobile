/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: conversationUpdate
// ====================================================

export interface conversationUpdate_conversationUpdate_participants_member_club {
  __typename: "Club";
  id: string;
  name: string;
}

export interface conversationUpdate_conversationUpdate_participants_member_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface conversationUpdate_conversationUpdate_participants_member_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
}

export interface conversationUpdate_conversationUpdate_participants_member {
  __typename: "Member";
  id: number;
  firstname: string | null;
  lastname: string | null;
  pic: string | null;
  club: conversationUpdate_conversationUpdate_participants_member_club;
  area: conversationUpdate_conversationUpdate_participants_member_area;
  association: conversationUpdate_conversationUpdate_participants_member_association;
}

export interface conversationUpdate_conversationUpdate_participants {
  __typename: "ConversationParticipant";
  id: string;
  iscallingidentity: boolean;
  firstname: string | null;
  lastname: string | null;
  /**
   * Can be archived ore removed already
   */
  member: conversationUpdate_conversationUpdate_participants_member | null;
}

export interface conversationUpdate_conversationUpdate {
  __typename: "Conversation";
  id: string;
  hasUnreadMessages: boolean;
  subject: string;
  pic: string | null;
  participants: conversationUpdate_conversationUpdate_participants[];
}

export interface conversationUpdate {
  conversationUpdate: conversationUpdate_conversationUpdate;
}
