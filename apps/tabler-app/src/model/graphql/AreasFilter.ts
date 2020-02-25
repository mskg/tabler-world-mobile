/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: AreasFilter
// ====================================================

export interface AreasFilter_Areas {
  __typename: "Area";
  id: string;
  shortname: string;
  name: string;
}

export interface AreasFilter {
  /**
   * Giving no id returns own organization
   */
  Areas: AreasFilter_Areas[] | null;
}
