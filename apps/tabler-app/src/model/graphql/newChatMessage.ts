/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: newChatMessage
// ====================================================

export interface newChatMessage_newChatMessage_payload {
  __typename: "ChatMessagePayload";
  text: string | null;
  image: string | null;
}

export interface newChatMessage_newChatMessage_sender {
  __typename: "Member";
  id: number;
  firstname: string | null;
  lastname: string | null;
  pic: string | null;
}

export interface newChatMessage_newChatMessage {
  __typename: "ChatMessage";
  id: string;
  eventId: string;
  payload: newChatMessage_newChatMessage_payload;
  sender: newChatMessage_newChatMessage_sender;
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

export interface newChatMessage {
  newChatMessage: newChatMessage_newChatMessage;
}

export interface newChatMessageVariables {
  conversation: string;
}
