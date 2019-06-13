import CryptoJS from "crypto-js";
import * as FileSystem from 'expo-file-system';
import { Categories, Logger } from '../../helper/Logger';
import { getKey } from "./Secret";

const logger = new Logger(Categories.ReduxComponent.FileStorage);

export const DocumentDir = FileSystem.documentDirectory;
export const CacheDir = FileSystem.cacheDirectory;

const resolvePath = (...paths: Array<string>) =>
    paths
        .join('/')
        .split('/')
        .filter(part => part && part !== '.')
        .join('/');

// Wrap function to support both Promise and callback
async function withCallback<R>(
    callback: (error: Error | undefined, result?: R) => void,
    func: () => Promise<R>,
): Promise<R | void> {
    try {
        const result = await func();
        if (callback) {
            callback(undefined, result);
        }

        return result;
    } catch (err) {
        if (callback) {
            callback(err);
        } else {
            logger.error(err);
            throw err;
        }
    }
}

export const EncryptedFileStorage = (
    location: string = DocumentDir,
    folder: string = 'data',
    encrypt: boolean = true,
) => {
    const baseFolder = resolvePath(location, folder);

    const pathForKey = (key: string) =>
        resolvePath(baseFolder, encodeURIComponent(key));

    const setItem = (
        key: string,
        value: string,
        callback: (error: Error | undefined) => void,
    ): Promise<void> =>
        withCallback(callback, async () => {
            const { exists } = await FileSystem.getInfoAsync(baseFolder);
            if (exists == false) {
                await FileSystem.makeDirectoryAsync(baseFolder, {
                    intermediates: true,
                });
            }

            const path = pathForKey(key);
            logger.debug("setItem", path);

            await FileSystem.writeAsStringAsync(
                path,
                encrypt
                    ?  CryptoJS.AES
                            .encrypt(value, await getKey())
                            .toString()
                    : value);

            logger.debug("wrote", path);
        });

    const getItem = (
        key: string,
        callback: (error: Error | undefined, result?: string) => void,
    ): Promise<string | undefined> =>
        withCallback(callback, async () => {
            const pathKey = pathForKey(key);
            const { exists } = await FileSystem.getInfoAsync(pathKey);
            logger.debug("getItem", pathKey, "exists?", exists);

            if (exists) {
                const value = await FileSystem.readAsStringAsync(pathKey);
                if (!encrypt) return value;

                var bytes = CryptoJS.AES.decrypt(
                    value,
                    await getKey());

                logger.debug("read", pathKey);
                return bytes.toString(CryptoJS.enc.Utf8);
            }

            return undefined;
            // } else {
            //     return null;
            // }
        });

    const removeItem = (
        key: string,
        callback: (error: Error | null) => void,
    ): Promise<void> =>
        withCallback(callback, async () => {
            const pathKey = pathForKey(key);
            logger.debug("removeItem", pathKey);

            await FileSystem.deleteAsync(pathKey, {
                idempotent: true,
            });

            logger.debug("deleted", pathKey);
        });

    const getAllKeys = (
        callback: (error: Error | null, keys: Array<string> | null) => void,
    ) =>
        withCallback(callback, async () => {
            logger.debug("getAllKeys");

            await FileSystem.makeDirectoryAsync(baseFolder, {
                intermediates: true,
            });

            const baseFolderLength = baseFolder.length;
            const files = await FileSystem.readDirectoryAsync(baseFolder);

            const result = files.map(fileUri =>
                decodeURIComponent(fileUri.substring(baseFolderLength)),
            );

            logger.debug("getAllKeys", result);
            return result;
        });

    return {
        setItem,
        getItem,
        removeItem,
        getAllKeys,
    };
};
