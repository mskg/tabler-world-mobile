import * as FileSystem from 'expo-file-system';
import { logger } from './logger';

export async function loadLanguageFromFile(fileName: string): Promise<any> {
    try {
        const exist = await FileSystem.getInfoAsync(fileName);

        if (exist.exists) {
            logger.debug('Language file exists');
            const langFile = await FileSystem.readAsStringAsync(fileName);
            return JSON.parse(langFile);
        }

        return null;
    } catch (e) {
        logger.error(e, 'loadOverridenLanguageFromFile', fileName);
    }

    return null;
}
