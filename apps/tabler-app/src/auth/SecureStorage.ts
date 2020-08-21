
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-community/async-storage';
import { Categories, Logger } from '../helper/Logger';
import { Mutex } from '../helper/Mutex';

const MEMORY_KEY = 'TokenStore';
const logger = new Logger(Categories.Helpers.SecureStore);

/**
 * Stores the tokens in the devices secure storage.
 * For compatibility reasons with the API, keys of entries are kept in AsyncStorage.
 */
export class SecureStorage {
    static dataMemory = {};
    static mutex = new Mutex();

    static fixKey(key): string {
        return key.replace(/[^a-z0-9\.\-_]/ig, '_');
    }

    static setItem(key, value) {
        logger.debug('set', key);

        const fixedKey = SecureStorage.fixKey(MEMORY_KEY + key);
        SecureStorage.dataMemory[key] = value;
        SecureStore.setItemAsync(fixedKey, value, {
          keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      });

        AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(Object.keys(SecureStorage.dataMemory)));
        return SecureStorage.dataMemory[key];
    }

    static getItem(key) {
        return Object.prototype.hasOwnProperty.call(SecureStorage.dataMemory, key)
      ? SecureStorage.dataMemory[key]
      : undefined;
    }

    static removeItem(key) {
        logger.debug('remove', key);
        const result = delete SecureStorage.dataMemory[key];

        const fixedKey = SecureStorage.fixKey(MEMORY_KEY + key);
        SecureStore.deleteItemAsync(fixedKey);

        AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(Object.keys(SecureStorage.dataMemory)));
        return result;
    }

    static clear() {
        SecureStorage.dataMemory = {};
        return SecureStorage.dataMemory;
    }

  /**
   * Rehydrate all keys from storage
   */
    static async sync() {
        const unlock = await SecureStorage.mutex.lock();

        try {
          if (Object.keys(SecureStorage.dataMemory).length > 0) {
            logger.debug('already hydrated');
            return;
        }

          logger.debug('hydrating');
          const hydrateKeys = await AsyncStorage.getItem(MEMORY_KEY);

          if (hydrateKeys != null) {
            SecureStorage.dataMemory = {};

            const keys = JSON.parse(hydrateKeys) as string[];

            for (const key of keys) {
              logger.debug('restore', key);

              const fixedKey = SecureStorage.fixKey(MEMORY_KEY + key);
              SecureStorage.dataMemory[key] = await SecureStore.getItemAsync(fixedKey);
          }
        } else {
            SecureStorage.dataMemory = {};
        }

          return 'SUCCESS';
      } finally {
          unlock();
      }
    }
}
