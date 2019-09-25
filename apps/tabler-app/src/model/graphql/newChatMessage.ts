/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: newChatMessage
// ====================================================

export interface newChatMessage_newChatMessage {
  __typename: "ChatMessage";
  id: string;
  payload: any | null;
  senderId: number | null;
  createdAt: any;
}

export interface newChatMessage {
  newChatMessage: newChatMessage_newChatMessage | null;
}
