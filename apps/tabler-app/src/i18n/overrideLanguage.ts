import * as FileSystem from 'expo-file-system';
import { AsyncStorage } from 'react-native';
import { Categories, Logger } from '../helper/Logger';
import { assignLanguage, loadLanguage } from './translation';

const logger = new Logger(Categories.App);

const KEY = 'OVERRIDE_LANG';
export async function overrideLanguage(lang: string) {
    await AsyncStorage.setItem(KEY, lang);
}

export async function getOverridenLanguage() {
    return await AsyncStorage.getItem(KEY);
}

export async function clearOverrideLanguage() {
    try {
        await FileSystem.deleteAsync(
            `${FileSystem.documentDirectory}i18n/${await getOverridenLanguage()}.json`,
        );
    } catch (e) {
        logger.log('Could not remove', e);
    }

    await AsyncStorage.removeItem(KEY);
}

export async function saveLanguageFile(lang: string, o: any) {
    logger.log('Writing language', lang);

    await FileSystem.makeDirectoryAsync(
        `${FileSystem.documentDirectory}i18n/`,
        { intermediates: true },
    );

    await FileSystem.writeAsStringAsync(
        `${FileSystem.documentDirectory}i18n/${lang}.json`,
        JSON.stringify(o),
    );
}

export async function loadOverridenLanguage() {
    const lang = await getOverridenLanguage();
    logger.log('loadOverridenLanguage', lang);

    if (lang) {
        const fileName = `${FileSystem.documentDirectory}i18n/${lang}.json`;
        const exist = await FileSystem.getInfoAsync(fileName);

        if (exist.exists) {
            logger.debug('Language file exists');

            const langFile = await FileSystem.readAsStringAsync(fileName);
            try {
                const translations = JSON.parse(langFile);
                assignLanguage({
                    ...translations,
                    id: lang,
                });
            } catch (e) {
                logger.error(e, 'loadOverridenLanguage', lang);
            }
        } else {
            loadLanguage(lang);
        }
    }
}
