/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SendMessage
// ====================================================

export interface SendMessage_sendMessage_payload {
  __typename: "ChatMessagePayload";
  text: string | null;
  image: string | null;
}

export interface SendMessage_sendMessage {
  __typename: "ChatMessage";
  id: string;
  eventId: string;
  payload: SendMessage_sendMessage_payload;
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

export interface SendMessage {
  sendMessage: SendMessage_sendMessage;
}

export interface SendMessageVariables {
  id: string;
  text?: string | null;
  image?: string | null;
  conversation: string;
}
