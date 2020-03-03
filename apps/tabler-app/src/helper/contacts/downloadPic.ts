import * as FileSystem from 'expo-file-system';
import { logger } from './logger';

export async function downloadPic(picUri: string, id: number) {
    try {

        logger.debug('has image', picUri);

        const { uri } = await FileSystem.downloadAsync(
            picUri,
            FileSystem.cacheDirectory + `contact_${id}`,
        );

        logger.debug('wrote image to', uri);
        return uri;
    } catch (e) {
        logger.error('downloadPic', e, { picUri, id });
        return null;
    }
}
