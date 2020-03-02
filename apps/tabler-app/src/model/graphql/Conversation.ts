/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Conversation
// ====================================================

export interface Conversation_Conversation_participants_member_club {
  __typename: "Club";
  id: string;
  name: string;
}

export interface Conversation_Conversation_participants_member_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface Conversation_Conversation_participants_member_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
}

export interface Conversation_Conversation_participants_member {
  __typename: "Member";
  id: number;
  firstname: string | null;
  lastname: string | null;
  pic: string | null;
  club: Conversation_Conversation_participants_member_club;
  area: Conversation_Conversation_participants_member_area;
  association: Conversation_Conversation_participants_member_association;
}

export interface Conversation_Conversation_participants {
  __typename: "ConversationParticipant";
  id: string;
  iscallingidentity: boolean;
  firstname: string | null;
  lastname: string | null;
  /**
   * Can be archived ore removed already
   */
  member: Conversation_Conversation_participants_member | null;
}

export interface Conversation_Conversation_messages_nodes_payload {
  __typename: "ChatMessagePayload";
  text: string | null;
  image: string | null;
}

export interface Conversation_Conversation_messages_nodes {
  __typename: "ChatMessage";
  id: string;
  eventId: string;
  payload: Conversation_Conversation_messages_nodes_payload;
  senderId: number | null;
  receivedAt: any;
  /**
   * Message was delivered to the recipients
   */
  delivered: boolean | null;
  /**
   * Message was received by the server
   */
  accepted: boolean | null;
}

export interface Conversation_Conversation_messages {
  __typename: "ChatMessageIterator";
  nodes: Conversation_Conversation_messages_nodes[];
  nextToken: string | null;
}

export interface Conversation_Conversation {
  __typename: "Conversation";
  id: string;
  hasUnreadMessages: boolean;
  subject: string;
  pic: string | null;
  participants: Conversation_Conversation_participants[];
  messages: Conversation_Conversation_messages;
}

export interface Conversation_Me {
  __typename: "Member";
  id: number;
}

export interface Conversation {
  Conversation: Conversation_Conversation | null;
  Me: Conversation_Me;
}

export interface ConversationVariables {
  id: string;
  token?: string | null;
  dontMarkAsRead?: boolean | null;
}
