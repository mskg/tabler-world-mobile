/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ConversationStatus
// ====================================================

export interface ConversationStatus_Conversation {
  __typename: "Conversation";
  id: string;
  hasUnreadMessages: boolean;
}

export interface ConversationStatus {
  Conversation: ConversationStatus_Conversation | null;
}

export interface ConversationStatusVariables {
  id: string;
}
