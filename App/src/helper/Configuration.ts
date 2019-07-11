import Constants from 'expo-constants';

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
    return Constants.manifest.extra[key];
}
