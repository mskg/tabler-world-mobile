import * as FileSystem from 'expo-file-system';
import { BASE_DIR } from './BASE_DIR';
import { CacheEntry } from './CacheEntry';
import { CacheGroup } from './CacheGroup';
import { DownloadOptions } from './DownloadOptions';

export default class CacheManager {
  // static entries: { [uri: string]: CacheEntry } = {};

  static get(uri: string, options: DownloadOptions, group: CacheGroup = "other"): CacheEntry {
    return  new CacheEntry(uri, options, group);

    // if (!CacheManager.entries[uri]) {
    //   CacheManager.entries[uri] = new CacheEntry(uri, options);
    // }

    // return CacheManager.entries[uri];
  }

  static async clearCache(group: CacheGroup): Promise<void> {
    await FileSystem.deleteAsync(BASE_DIR, { idempotent: true });
    await FileSystem.makeDirectoryAsync(BASE_DIR);
  }

  // static async getCacheSize(): Promise<number> {
  //   const { size } = await FileSystem.getInfoAsync(BASE_DIR, { size: true });
  //   return size;
  // }
}
