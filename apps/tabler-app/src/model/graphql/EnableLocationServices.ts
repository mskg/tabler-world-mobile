/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MyLocationInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: EnableLocationServices
// ====================================================

export interface EnableLocationServices {
  /**
   * Updates a setting
   */
  putSetting: boolean | null;
  /**
   * Updates a setting
   */
  nearbymembersMap: boolean | null;
  putLocation: boolean | null;
}

export interface EnableLocationServicesVariables {
  location: MyLocationInput;
  map: any;
}
