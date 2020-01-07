import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Appearance } from 'react-native-appearance';

export enum Features {
    ContactSync,
    LocalBirthdayNotifications,
    EncryptedStorage,
    BackgroundFetch,
    SendToAdressbook,
    ClubMap,
    BackgroundLocation,
    LocationHistory,
    DarkModeSwitch,
    InternalInformation,
}

export function isFeatureEnabled(feature: Features) {
    if (feature === Features.BackgroundFetch) {
        return true;
    }

    if (feature === Features.BackgroundLocation || feature === Features.ClubMap) {
        return true;
    }

    if (feature === Features.LocationHistory) {
        return Constants.manifest.releaseChannel == null || Constants.manifest.releaseChannel.endsWith('-test');
    }

    if (feature === Features.InternalInformation) {
        return Constants.manifest.releaseChannel == null || Constants.manifest.releaseChannel.endsWith('-test');
    }

    if (feature === Features.SendToAdressbook && Platform.OS === 'ios') {
        return true;
    }

    if (feature === Features.DarkModeSwitch) {
        return Appearance.getColorScheme() === 'no-preference';
    }

    return false;
}
