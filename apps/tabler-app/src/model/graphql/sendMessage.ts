/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: sendMessage
// ====================================================

export interface sendMessage_startConversation {
  __typename: "Conversation";
  id: string;
}

export interface sendMessage_sendMessage {
  __typename: "ChatMessage";
  id: string;
  payload: any | null;
  createdAt: any;
}

export interface sendMessage {
  startConversation: sendMessage_startConversation | null;
  sendMessage: sendMessage_sendMessage | null;
}

export interface sendMessageVariables {
  message: string;
}
