import { Platform } from 'react-native';

export enum Features {
    ContactSync,
    LocalBirthdayNotifications,
    EncryptedStorage,
    BackgroundFetch,
}

export function isFeatureEnabled(feature: Features) {
    if (feature === Features.BackgroundFetch && Platform.OS === "ios") {
        return true;
    }

    return false;
}
