/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ChatMessageFragment
// ====================================================

export interface ChatMessageFragment_payload {
  __typename: "ChatMessagePayload";
  text: string | null;
  image: string | null;
}

export interface ChatMessageFragment_sender {
  __typename: "Member";
  id: number;
  firstname: string | null;
  lastname: string | null;
  pic: string | null;
}

export interface ChatMessageFragment {
  __typename: "ChatMessage";
  id: string;
  eventId: string;
  payload: ChatMessageFragment_payload;
  sender: ChatMessageFragment_sender;
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
