import * as FileSystem from 'expo-file-system';
import { CacheGroup } from './CacheGroup';
import { DownloadOptions } from './DownloadOptions';
import { getCacheEntry } from './getCacheEntry';
import { logger } from './logger';

export class CacheEntry {
    constructor(private uri: string, private options: DownloadOptions, private group: CacheGroup) {
    }

    async getPath(): Promise<string | undefined> {
        // tslint:disable-next-line: no-this-assignment
        const { uri, options } = this;

        if (uri.toLowerCase().startsWith('file://')) {
            logger.log('Ignoring local uri', uri);
            return uri;
        }

        const { path, exists, tmpPath } = await getCacheEntry(uri, this.group);

        if (exists) {
            if (false && __DEV__) {
                return new Promise(
                    (resolve) => setTimeout(
                        () => resolve(path), 4000),
                );
            }

            return path;
        }

        // const encodedUri = encodeURI(uri);
        try {
            logger.debug('Downloading', uri, 'to', tmpPath);
            let result = await FileSystem.createDownloadResumable(
                uri,
                tmpPath,
                options,
            ).downloadAsync();

            // If the image download failed, we don't cache anything
            if (result && result.status !== 200) {
                logger.log('Failed to download uri, status != 200', uri, result.status);

                const encoded = encodeURI(uri);
                if (encoded !== uri) {
                    logger.log('Retry with encoded URI', encoded);

                    result = await FileSystem.createDownloadResumable(
                        encoded,
                        tmpPath,
                        options,
                    ).downloadAsync();

                    if (result && result.status !== 200) {
                        logger.log('Failed to download uri, status != 200', encoded, result.status);

                        try {
                            await FileSystem.deleteAsync(tmpPath);
                            await FileSystem.deleteAsync(path);
                        } catch { }
                    }
                } else {
                    try {
                        await FileSystem.deleteAsync(tmpPath);
                        await FileSystem.deleteAsync(path);
                    } catch { }
                }

                return undefined;
            }
        } catch (e) {
            logger.log('Error downloading uri', uri, e);
            return undefined;
        }

        await FileSystem.moveAsync({ from: tmpPath, to: path });
        return path;
    }
}
