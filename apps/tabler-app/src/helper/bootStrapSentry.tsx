import * as Sentry from 'sentry-expo';
import { getConfigValue } from './getConfigValue';

export function bootStrapSentry() {
    const sentry = getConfigValue('sentry');

    if (sentry !== null && sentry !== '') {
        // ExpoSentry.enableInExpoDevelopment = true;
        Sentry.init({
            dsn: sentry,
        });
    }
}
