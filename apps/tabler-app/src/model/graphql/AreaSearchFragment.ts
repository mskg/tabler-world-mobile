/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: AreaSearchFragment
// ====================================================

export interface AreaSearchFragment_association_family {
  __typename: "Family";
  id: string;
  name: string;
  shortname: string;
}

export interface AreaSearchFragment_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
  family: AreaSearchFragment_association_family;
}

export interface AreaSearchFragment {
  __typename: "Area";
  name: string;
  id: string;
  shortname: string;
  association: AreaSearchFragment_association;
}
