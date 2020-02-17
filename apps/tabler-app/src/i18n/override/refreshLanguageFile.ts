import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import { getConfigValue } from '../../helper/getConfigValue';
import { logger } from './logger';

export async function refreshLanguageFile(lang: string): Promise<boolean> {
    logger.log('refreshLanguageFile', lang);

    try {
        const baseUrl = getConfigValue<string>('translations');
        if (!baseUrl) {
            return false;
        }

        const finalUrl = baseUrl
            .replace('#lang#', lang)
            .replace('#channel#', Constants.manifest.releaseChannel || 'dev');
        logger.log('refreshLanguageFile', 'finalUrl', finalUrl);

        await FileSystem.makeDirectoryAsync(
            `${FileSystem.documentDirectory}i18n/`,
            { intermediates: true },
        );

        const tempFile = `${FileSystem.documentDirectory}i18n/temp.tempFile`;
        const response = await FileSystem.downloadAsync(finalUrl, tempFile);
        const fileName = `${FileSystem.documentDirectory}i18n/${lang}.json`;

        try { await FileSystem.deleteAsync(fileName); } catch { }
        if (response.status === 200) {
            await FileSystem.moveAsync({ from: tempFile, to: fileName });

            return true;
        }

        logger.log(response);
        return false;
    } catch (e) {
        logger.error(e, 'loadAdditionalLanguageFiles', lang);
        return false;
    }
}
