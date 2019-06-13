import Constants from 'expo-constants';
import ExpoSentry from "sentry-expo";

export function bootStrapSentry() {
    const extra = Constants.manifest.extra || {};
    if (extra.sentry !== null && extra.sentry !== "") {
        // ExpoSentry.enableInExpoDevelopment = true;
        ExpoSentry.config(extra.sentry).install();
    }
}
