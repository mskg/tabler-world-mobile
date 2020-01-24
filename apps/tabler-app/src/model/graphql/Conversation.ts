/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Conversation
// ====================================================

export interface Conversation_Conversation_members_club {
  __typename: "Club";
  id: string;
  name: string;
}

export interface Conversation_Conversation_members_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface Conversation_Conversation_members_association {
  __typename: "Association";
  id: string;
  name: string;
}

export interface Conversation_Conversation_members {
  __typename: "Member";
  id: number;
  firstname: string | null;
  lastname: string | null;
  pic: string | null;
  club: Conversation_Conversation_members_club;
  area: Conversation_Conversation_members_area;
  association: Conversation_Conversation_members_association;
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
  members: Conversation_Conversation_members[];
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
}
