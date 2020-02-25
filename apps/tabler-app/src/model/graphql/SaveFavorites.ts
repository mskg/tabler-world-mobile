/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SettingInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SaveFavorites
// ====================================================

export interface SaveFavorites {
  /**
   * Updates a setting
   */
  putSetting: boolean | null;
}

export interface SaveFavoritesVariables {
  input: SettingInput;
}
