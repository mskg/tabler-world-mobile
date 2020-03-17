/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: StartConversation
// ====================================================

export interface StartConversation_startConversation_participants_member_club {
  __typename: "Club";
  id: string;
  name: string;
}

export interface StartConversation_startConversation_participants_member_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface StartConversation_startConversation_participants_member_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
}

export interface StartConversation_startConversation_participants_member {
  __typename: "Member";
  id: number;
  firstname: string | null;
  lastname: string | null;
  pic: string | null;
  club: StartConversation_startConversation_participants_member_club;
  area: StartConversation_startConversation_participants_member_area;
  association: StartConversation_startConversation_participants_member_association;
}

export interface StartConversation_startConversation_participants {
  __typename: "ConversationParticipant";
  id: string;
  iscallingidentity: boolean;
  firstname: string | null;
  lastname: string | null;
  /**
   * Can be archived ore removed already
   */
  member: StartConversation_startConversation_participants_member | null;
}

export interface StartConversation_startConversation {
  __typename: "Conversation";
  id: string;
  hasUnreadMessages: boolean;
  subject: string;
  pic: string | null;
  participants: StartConversation_startConversation_participants[];
}

export interface StartConversation {
  startConversation: StartConversation_startConversation;
}

export interface StartConversationVariables {
  member: number;
}
