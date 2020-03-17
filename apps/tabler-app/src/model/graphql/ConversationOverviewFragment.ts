/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ConversationOverviewFragment
// ====================================================

export interface ConversationOverviewFragment_participants_member_club {
  __typename: "Club";
  id: string;
  name: string;
}

export interface ConversationOverviewFragment_participants_member_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface ConversationOverviewFragment_participants_member_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
}

export interface ConversationOverviewFragment_participants_member {
  __typename: "Member";
  id: number;
  firstname: string | null;
  lastname: string | null;
  pic: string | null;
  club: ConversationOverviewFragment_participants_member_club;
  area: ConversationOverviewFragment_participants_member_area;
  association: ConversationOverviewFragment_participants_member_association;
}

export interface ConversationOverviewFragment_participants {
  __typename: "ConversationParticipant";
  id: string;
  iscallingidentity: boolean;
  firstname: string | null;
  lastname: string | null;
  /**
   * Can be archived ore removed already
   */
  member: ConversationOverviewFragment_participants_member | null;
}

export interface ConversationOverviewFragment {
  __typename: "Conversation";
  id: string;
  hasUnreadMessages: boolean;
  subject: string;
  pic: string | null;
  participants: ConversationOverviewFragment_participants[];
}
