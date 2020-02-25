/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: AreaSearchFragment
// ====================================================

export interface AreaSearchFragment_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
}

export interface AreaSearchFragment {
  __typename: "Area";
  name: string;
  id: string;
  shortname: string;
  association: AreaSearchFragment_association;
}
