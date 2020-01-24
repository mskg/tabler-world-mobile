import Constants from 'expo-constants';
import * as Sentry from 'sentry-expo';
import { getConfigValue } from './getConfigValue';

export function bootStrapSentry() {
    // https://docs.expo.io/versions/latest/guides/using-sentry/
    const sentry = getConfigValue('sentry');

    if (sentry !== null && sentry !== '') {
        // ExpoSentry.enableInExpoDevelopment = true;
        Sentry.init({
            dsn: sentry,
            debug: __DEV__,
        });

        if (Constants.manifest.revisionId) {
            Sentry.setRelease(Constants.manifest.revisionId);
        }
    }
}
