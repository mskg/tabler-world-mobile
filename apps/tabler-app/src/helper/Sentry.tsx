import ExpoSentry from 'sentry-expo';
import { getConfigValue } from './Configuration';

export function bootStrapSentry() {
    const sentry = getConfigValue('sentry');

    if (sentry !== null && sentry !== '') {
        // ExpoSentry.enableInExpoDevelopment = true;
        ExpoSentry.config(sentry).install();
    }
}
