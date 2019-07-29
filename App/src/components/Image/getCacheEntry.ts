import { SHA1 } from "crypto-js";
import * as FileSystem from 'expo-file-system';
import _ from "lodash";
import { BASE_DIR } from "./BASE_DIR";
import { CacheGroup } from './CacheGroup';

export const getCacheEntry = async (uri: string, group: CacheGroup): Promise<{
  exists: boolean;
  path: string;
  tmpPath: string;
}> => {
  const filename = uri.substring(uri.lastIndexOf("/"), uri.indexOf("?") === -1 ? uri.length : uri.indexOf("?"));
  const ext = filename.indexOf(".") === -1
    ? ".jpg"
    : filename.substring(filename.lastIndexOf("."));

  const baseDir = `${BASE_DIR}${group}/`;
  const path = `${baseDir}${SHA1(uri)}${ext}`;
  const tmpPath = `${baseDir}${SHA1(uri)}-${_.uniqueId()}${ext}`;

  // TODO: maybe we don't have to do this every time
  try {
    await FileSystem.makeDirectoryAsync(baseDir);
  }
  catch (e) {
    // do nothing
  }

  const info = await FileSystem.getInfoAsync(path);
  const { exists } = info;

  return { exists, path, tmpPath };
};
