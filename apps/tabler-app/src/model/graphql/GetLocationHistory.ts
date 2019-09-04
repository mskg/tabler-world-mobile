/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetLocationHistory
// ====================================================

export interface GetLocationHistory_LocationHistory {
  __typename: "LocationHistory";
  lastseen: any;
  city: string | null;
  street: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface GetLocationHistory {
  LocationHistory: GetLocationHistory_LocationHistory[] | null;
}
