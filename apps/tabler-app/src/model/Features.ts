import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Appearance } from 'react-native-appearance';
import { isDemoModeEnabled } from '../helper/demoMode';

export enum Features {
    ContactSync,
    LocalBirthdayNotifications,
    EncryptedStorage,
    BackgroundFetch,
    SendToAdressbook,
    ClubMap,
    LocationHistory,
    DarkModeSwitch,
    Chat,
}

// this is a very dirty hack to synchronously check demo mode
// as we reload the app upon demo on-/off this might work?
let isDemoMode: boolean = false;
(async () => { isDemoMode = await isDemoModeEnabled(); })();

export function isFeatureEnabled(feature: Features) {
    if (feature === Features.BackgroundFetch) {
        return true;
    }

    if (feature === Features.ClubMap) {
        return true;
    }

    if (feature === Features.LocationHistory) {
        return Constants.manifest.releaseChannel == null || Constants.manifest.releaseChannel.endsWith('-test');
    }

    if (feature === Features.SendToAdressbook && Platform.OS === 'ios') {
        return true;
    }

    if (feature === Features.Chat) {
        return !isDemoMode;
    }

    if (feature === Features.DarkModeSwitch) {
        return Appearance.getColorScheme() === 'no-preference';
    }

    return false;
}
