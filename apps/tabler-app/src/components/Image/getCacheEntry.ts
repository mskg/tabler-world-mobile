import { SHA1 } from 'crypto-js';
import * as FileSystem from 'expo-file-system';
import { uniqueId } from 'lodash';
import { BASE_DIR } from './BASE_DIR';
import { CacheGroup } from './CacheGroup';
import { logger } from './logger';

export const getCacheEntry = async (uri: string, group: CacheGroup): Promise<{
    exists: boolean;
    path: string;
    tmpPath: string;
}> => {
    let sha1Uri = uri;

    const filename = uri.substring(uri.lastIndexOf('/'), uri.indexOf('?') === -1 ? uri.length : uri.indexOf('?'));
    const ext = filename.indexOf('.') === -1
        ? '.jpg'
        : filename.substring(filename.lastIndexOf('.'));

    // signed URLs here, we ignore the parameters
    if (group === 'chat' && uri.indexOf('?') !== -1) {
        sha1Uri = uri.substring(0, uri.indexOf('?'));
    }

    logger.debug('getCacheEntry from', sha1Uri);

    const baseDir = `${BASE_DIR}${group}/`;
    const path = `${baseDir}${SHA1(sha1Uri)}${ext}`;
    const tmpPath = `${baseDir}${SHA1(sha1Uri)}-${uniqueId()}${ext}`;

    // TODO: maybe we don't have to do this every time
    try {
        await FileSystem.makeDirectoryAsync(baseDir, { intermediates: true });
    } catch (e) {
        // do nothing
    }

    const info = await FileSystem.getInfoAsync(path);
    const { exists } = info;

    return { exists, path, tmpPath };
};
