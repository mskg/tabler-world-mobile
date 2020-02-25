/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: AssociationName
// ====================================================

export interface AssociationName_Association {
  __typename: "Association";
  id: string;
  name: string;
}

export interface AssociationName {
  /**
   * Giving no id returns own organization
   */
  Association: AssociationName_Association | null;
}

export interface AssociationNameVariables {
  id?: string | null;
}
