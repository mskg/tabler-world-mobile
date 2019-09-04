import Constants from 'expo-constants';
import { Platform } from 'react-native';

export enum Features {
    ContactSync,
    LocalBirthdayNotifications,
    EncryptedStorage,
    BackgroundFetch,
    SendToAdressbook,
    ClubMap,
    BackgroundLocation,
    LocationHistory,
}

export function isFeatureEnabled(feature: Features) {
    if (feature === Features.BackgroundFetch) {
        return true;
    }

    if (feature === Features.BackgroundLocation || feature === Features.ClubMap) {
        return true;
    }

    if (feature === Features.LocationHistory) {
        return Constants.manifest.releaseChannel == null || Constants.manifest.releaseChannel.endsWith('-beta');
    }

    if (feature === Features.SendToAdressbook && Platform.OS === 'ios') {
        return true;
    }

    return false;
}
