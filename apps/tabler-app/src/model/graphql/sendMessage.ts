/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SendMessage
// ====================================================

export interface SendMessage_sendMessage {
  __typename: "ChatMessage";
  id: string;
  eventId: string;
  payload: any | null;
  senderId: number | null;
  receivedAt: any;
  sent: boolean | null;
}

export interface SendMessage {
  sendMessage: SendMessage_sendMessage;
}

export interface SendMessageVariables {
  id: string;
  message: string;
}
