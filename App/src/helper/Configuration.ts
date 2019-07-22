import Constants from 'expo-constants';
import { Platform } from 'react-native';

type Key =
    "region"
    | "identityPoolId"
    | "userPoolId"
    | "userPoolWebClientId"
    | "api"
    | "apidemo"
    | "sentry"
    | "cognitoAnalytics"
    | "amplitudeAnalytics"
    | "profile"
    | "world"
    | "join"
    | "support"
;

export function getConfigValue(key: Key): string {
    if (key === "api" && __DEV__) {
        if (Platform.OS === "android" && (Constants.deviceName || "").startsWith("Android SDK")) {
            // default redirect to localhost for android emulator
            return "http://10.0.2.2:3000";
        } else if (Platform.OS === "ios") {
            return "http://localhost:3000";
        }
    }

    return Constants.manifest.extra[key];
}
