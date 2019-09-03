import * as FileSystem from 'expo-file-system';
import { BASE_DIR } from './BASE_DIR';
import { CacheEntry } from './CacheEntry';
import { CacheGroup } from './CacheGroup';
import { DownloadOptions } from './DownloadOptions';
import { logger } from './logger';

export default class CacheManager {
    // static entries: { [uri: string]: CacheEntry } = {};

    static get(uri: string, options: DownloadOptions, group: CacheGroup = 'other'): CacheEntry {
        return new CacheEntry(uri, options, group);
    }

    static async clearCache(group: CacheGroup): Promise<void> {
        logger.log('clearCache', group);
        const baseDir = `${BASE_DIR}${group}/`;

        await FileSystem.deleteAsync(baseDir, { idempotent: true });
        await FileSystem.makeDirectoryAsync(baseDir, { intermediates: true });
    }

    static async outDateCache(group: CacheGroup): Promise<void> {
        logger.log('outdate cache', group);
        const baseDir = `${BASE_DIR}${group}/`;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 14);

        const files = await FileSystem.readDirectoryAsync(baseDir);
        for (const file of files) {
            const fi = await FileSystem.getInfoAsync(baseDir + file);

            if (fi.modificationTime && fi.modificationTime < oneWeekAgo.getTime()) {
                logger.debug('Removing', fi.uri);
                await FileSystem.deleteAsync(fi.uri, { idempotent: true });
            }
        }
    }
}
