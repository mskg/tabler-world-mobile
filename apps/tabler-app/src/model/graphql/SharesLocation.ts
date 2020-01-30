/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SharesLocation
// ====================================================

export interface SharesLocation_Member {
  __typename: "Member";
  id: number;
  sharesLocation: boolean | null;
}

export interface SharesLocation {
  Member: SharesLocation_Member | null;
}

export interface SharesLocationVariables {
  id: number;
}
