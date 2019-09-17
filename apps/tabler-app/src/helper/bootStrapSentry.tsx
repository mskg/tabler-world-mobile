import ExpoSentry from 'sentry-expo';
import { getConfigValue } from './getConfigValue';

export function bootStrapSentry() {
    const sentry = getConfigValue('sentry');

    if (sentry !== null && sentry !== '') {
        // ExpoSentry.enableInExpoDevelopment = true;
        ExpoSentry.config(sentry).install();
    }
}
