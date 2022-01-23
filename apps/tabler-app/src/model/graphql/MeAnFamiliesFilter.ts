/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: MeAnFamiliesFilter
// ====================================================

export interface MeAnFamiliesFilter_Me_family {
  __typename: "Family";
  id: string;
}

export interface MeAnFamiliesFilter_Me_association {
  __typename: "Association";
  id: string;
}

export interface MeAnFamiliesFilter_Me {
  __typename: "Member";
  id: number;
  family: MeAnFamiliesFilter_Me_family;
  association: MeAnFamiliesFilter_Me_association;
}

export interface MeAnFamiliesFilter_Families {
  __typename: "Family";
  id: string;
  name: string;
}

export interface MeAnFamiliesFilter {
  Me: MeAnFamiliesFilter_Me;
  Families: MeAnFamiliesFilter_Families[] | null;
}
