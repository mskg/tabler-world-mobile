/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: AssociationSearchFragment
// ====================================================

export interface AssociationSearchFragment_family {
  __typename: "Family";
  id: string;
  name: string;
  shortname: string;
}

export interface AssociationSearchFragment {
  __typename: "Association";
  name: string;
  id: string;
  logo: string | null;
  shortname: string;
  flag: string | null;
  family: AssociationSearchFragment_family;
}
