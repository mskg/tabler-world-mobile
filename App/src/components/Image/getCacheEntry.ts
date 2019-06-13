import { SHA1 } from "crypto-js";
import * as FileSystem from 'expo-file-system';
import _ from "lodash";
import { BASE_DIR } from "./BASE_DIR";

export const getCacheEntry = async (uri: string): Promise<{
  exists: boolean;
  path: string;
  tmpPath: string;
}> => {
  const filename = uri.substring(uri.lastIndexOf("/"), uri.indexOf("?") === -1 ? uri.length : uri.indexOf("?"));
  const ext = filename.indexOf(".") === -1
    ? ".jpg"
    : filename.substring(filename.lastIndexOf("."));
  const path = `${BASE_DIR}${SHA1(uri)}${ext}`;
  const tmpPath = `${BASE_DIR}${SHA1(uri)}-${_.uniqueId()}${ext}`;
  // TODO: maybe we don't have to do this every time
  try {
    await FileSystem.makeDirectoryAsync(BASE_DIR);
  }
  catch (e) {
    // do nothing
  }
  const info = await FileSystem.getInfoAsync(path);
  const { exists } = info;
  return { exists, path, tmpPath };
};
