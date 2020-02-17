import { AppStateStatus, AsyncStorage } from 'react-native';
import { getAppLanguage } from '../../i18n/getAppLanguage';
import { loadLanguageFiles } from '../../i18n/loadLanguageFiles';
import { refreshLanguageFile } from '../../i18n/override/refreshLanguageFile';
import { logger } from './logger';

const LAST_LANGUAGE_UPDATE = 'language-update';

/**
 * Checks for App updates
 */
export function* checkLanguageFiles(state: AppStateStatus) {
    if (state !== 'active') {
        return;
    }

    const lastUpate = parseInt(yield AsyncStorage.getItem(LAST_LANGUAGE_UPDATE) || '0', 10);
    const minutesElapsed = (Date.now() - lastUpate) / 1000 / 60;

    if (minutesElapsed > 24 * 60 || __DEV__) {
        try {
            const result = yield refreshLanguageFile(getAppLanguage());
            if (result) {
                // apply it immediatly
                yield loadLanguageFiles();
            }
        } catch (e) {
            // we don't handle this as errors
            logger.log(e, 'Error while trying to check for updates');
        } finally {
            yield AsyncStorage.setItem(LAST_LANGUAGE_UPDATE, Date.now().toString());
        }
    }
}
