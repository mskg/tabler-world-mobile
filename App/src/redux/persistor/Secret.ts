
import CryptoJS from "crypto-js";
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Categories, Logger } from '../../helper/Logger';
import { FILESTORAGE_KEY } from './Constants';

const logger = new Logger(Categories.ReduxComponent.FileStorage);

export async function getKey(): Promise<string> {
    const existing = await SecureStore.getItemAsync(FILESTORAGE_KEY);
    if (existing != null) {
        logger.debug("key exists");
        return existing;
    }

    const generated = CryptoJS.PBKDF2(
        Constants.installationId, Date.now.toString(),
        { keySize: 512 / 32, iterations: 1000 }
    ).toString();

    logger.debug("generating new key");
    await SecureStore.setItemAsync(FILESTORAGE_KEY, generated);

    return generated;
}
