/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ConversationOverviewFragment
// ====================================================

export interface ConversationOverviewFragment_members_club {
  __typename: "Club";
  id: string;
  name: string;
}

export interface ConversationOverviewFragment_members_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface ConversationOverviewFragment_members_association {
  __typename: "Association";
  id: string;
  name: string;
}

export interface ConversationOverviewFragment_members {
  __typename: "Member";
  id: number;
  firstname: string | null;
  lastname: string | null;
  pic: string | null;
  club: ConversationOverviewFragment_members_club;
  area: ConversationOverviewFragment_members_area;
  association: ConversationOverviewFragment_members_association;
}

export interface ConversationOverviewFragment {
  __typename: "Conversation";
  id: string;
  hasUnreadMessages: boolean;
  members: ConversationOverviewFragment_members[];
}
