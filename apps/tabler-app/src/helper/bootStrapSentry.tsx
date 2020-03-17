import Constants from 'expo-constants';
import { pick } from 'lodash';
import * as Sentry from 'sentry-expo';
import { I18N } from '../i18n/translation';
import { getConfigValue } from './getConfigValue';

export function bootStrapSentry() {
    // https://docs.expo.io/versions/latest/guides/using-sentry/
    const sentry = getConfigValue('sentry');

    if (sentry !== null && sentry !== '') {
        // ExpoSentry.enableInExpoDevelopment = true;
        Sentry.init({
            dsn: sentry,
            debug: __DEV__,
            normalizeDepth: 10,
        });

        if (Constants.manifest.revisionId) {
            Sentry.setRelease(Constants.manifest.revisionId);
        }

        if (Constants.manifest.releaseId) {
            Sentry.setTag('expoReleaseId', Constants.manifest.releaseId);
        }

        Sentry.setTag('language', I18N.id);

        Sentry.setExtras({
            manifest: pick(
                Constants.manifest,
                [
                    'bundleUrl',
                    'commitTime',
                    'extra',
                    'hostUri',
                    'id',
                    'isVerified',
                    'loadedFromCache',
                    'orientation',
                    'releaseId',
                ],
            ),
        });
    }
}
