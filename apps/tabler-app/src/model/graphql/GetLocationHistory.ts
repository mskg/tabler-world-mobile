/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetLocationHistory
// ====================================================

export interface GetLocationHistory_LocationHistory_location {
  __typename: "GeoPoint";
  longitude: number;
  latitude: number;
}

export interface GetLocationHistory_LocationHistory_locationName {
  __typename: "LocationName";
  name: string | null;
  country: string | null;
}

export interface GetLocationHistory_LocationHistory {
  __typename: "LocationHistory";
  lastseen: any;
  accuracy: number;
  location: GetLocationHistory_LocationHistory_location | null;
  locationName: GetLocationHistory_LocationHistory_locationName;
}

export interface GetLocationHistory {
  LocationHistory: GetLocationHistory_LocationHistory[] | null;
}
