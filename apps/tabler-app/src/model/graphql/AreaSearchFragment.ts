/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: AreaSearchFragment
// ====================================================

export interface AreaSearchFragment_association {
  __typename: "Association";
  id: string;
  name: string;
}

export interface AreaSearchFragment {
  __typename: "Area";
  name: string;
  id: string;
  shortname: string;
  association: AreaSearchFragment_association;
}
