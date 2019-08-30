import { createAction } from './action';

export type SettingsType =
  | { name: "syncFavorites", value: boolean }
  | { name: "syncOwnTable", value: boolean }
  | { name: "sortByLastName", value: boolean }
  | { name: "diplayFirstNameFirst", value: boolean }

  | { name: "messagingApp", value: string | undefined }
  | { name: "browserApp", value: string | undefined }
  | { name: "emailApp", value: string | undefined }
  | { name: "phoneApp", value: string | undefined }

  | { name: "darkMode", value: boolean }
  | { name: "experiments", value: boolean }
  | { name: "nearbyMembers", value: boolean }
;

/**
 * Update a setting in the state
 */
export const updateSetting = createAction<'@@settings/update', SettingsType>(
  '@@settings/update'
);

export const storePushToken = createAction<'@@settings/pushToken', string>(
  '@@settings/pushToken'
);

export const restoreSettings = createAction<'@@settings/restoreSettings'>(
  '@@settings/restoreSettings'
);

export const storeLanguage = createAction<'@@settings/storeLanguage'>(
  '@@settings/storeLanguage'
);
