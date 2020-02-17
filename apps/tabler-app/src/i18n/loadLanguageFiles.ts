import * as FileSystem from 'expo-file-system';
import { getAppLanguage } from './getAppLanguage';
import { loadLanguageFromFile } from './override/loadLanguageFromFile';
import { logger } from './override/logger';
import { getOverridenLanguage } from './overrideLanguage';
import { replaceCurrentLanguage } from './translation';

export async function loadLanguageFiles() {
    try {
        // if it is overriden and the file exists, we load that
        const overridenLanguage = await getOverridenLanguage();
        if (overridenLanguage) {
            const overridenFileName = `${FileSystem.documentDirectory}i18n/override_${overridenLanguage}.json`;
            const overridenLanguageObj = await loadLanguageFromFile(overridenFileName);

            if (overridenLanguageObj) {
                logger.log('Found overriden language', overridenLanguage);

                replaceCurrentLanguage({
                    ...overridenLanguageObj,
                    id: overridenLanguage,
                });

                return;
            }
        }

        const appLanguage = getAppLanguage();
        const fileName = `${FileSystem.documentDirectory}i18n/${appLanguage}.json`;
        const languageObject = await loadLanguageFromFile(fileName);

        if (languageObject) {
            logger.log('Found new language file', appLanguage);

            replaceCurrentLanguage({
                ...languageObject,
                id: appLanguage,
            });
        }
    } catch (e) {
        logger.error(e, 'loadLanguageFiles');
    }
}
