/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SendMessage
// ====================================================

export interface SendMessage_sendMessage_payload {
  __typename: "ChatMessagePayload";
  text: string | null;
  image: string | null;
}

export interface SendMessage_sendMessage_sender {
  __typename: "Member";
  id: number;
  firstname: string | null;
  lastname: string | null;
  pic: string | null;
}

export interface SendMessage_sendMessage {
  __typename: "ChatMessage";
  id: string;
  eventId: string;
  payload: SendMessage_sendMessage_payload;
  sender: SendMessage_sendMessage_sender;
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

export interface SendMessage {
  sendMessage: SendMessage_sendMessage;
}

export interface SendMessageVariables {
  id: string;
  text?: string | null;
  image?: string | null;
  conversation: string;
}
