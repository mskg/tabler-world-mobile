/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: StartConversation
// ====================================================

export interface StartConversation_startConversation_members_club {
  __typename: "Club";
  id: string;
  name: string;
}

export interface StartConversation_startConversation_members_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface StartConversation_startConversation_members_association {
  __typename: "Association";
  id: string;
  name: string;
}

export interface StartConversation_startConversation_members {
  __typename: "Member";
  id: number;
  firstname: string | null;
  lastname: string | null;
  pic: string | null;
  club: StartConversation_startConversation_members_club;
  area: StartConversation_startConversation_members_area;
  association: StartConversation_startConversation_members_association;
}

export interface StartConversation_startConversation {
  __typename: "Conversation";
  id: string;
  hasUnreadMessages: boolean;
  members: StartConversation_startConversation_members[];
}

export interface StartConversation {
  startConversation: StartConversation_startConversation;
}

export interface StartConversationVariables {
  member: number;
}
