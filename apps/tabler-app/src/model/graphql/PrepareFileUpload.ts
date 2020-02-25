/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: PrepareFileUpload
// ====================================================

export interface PrepareFileUpload_prepareFileUpload {
  __typename: "S3PresignedPost";
  url: string;
  fields: any;
}

export interface PrepareFileUpload {
  prepareFileUpload: PrepareFileUpload_prepareFileUpload;
}

export interface PrepareFileUploadVariables {
  conversationId: string;
}
