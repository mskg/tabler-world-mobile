import _ from "lodash";
import { IApolloContext } from "../types/IApolloContext";

type CacheKeyType = string;

type MakeKeyFunc<K> = (key: K) => CacheKeyType;
type KeyFromRecordFunc = (record: any) => CacheKeyType;

type LoadFunc<K> = (ids: K[]) => Promise<any[]>;

/**
 * This functions backs the DataLoader function by a cache.
 *
 * IDs are first requested from cache
 * All missing ids are requested from DataLoader and persisted to the cache afterwards
 * The whole result is returned
 */
export function cachedDataLoader<K>(
    { cache, logger }: IApolloContext,
    keyFunc: MakeKeyFunc<K>,
    keyRecordFunc: KeyFromRecordFunc,
    loadFunc: LoadFunc<K>,
    ttl: number,
): LoadFunc<K> {

    return async (ids: K[]) => {
        logger.log("[cachedDataLoader]", "loading", ids);

        const cached = await cache.getMany(
            ids.map(id => keyFunc(id))
        );

        const existing = Object.keys(cached);
        const missing = [...ids];
        _.remove(missing, id => existing.find(e => e === keyFunc(id)));

        if (missing.length > 0) {
            logger.log("[cachedDataLoader]", "missing keys", missing);

            const loadFromDb: any[] = await loadFunc(missing);

            // update cache with fresh data
            await cache.setMany(
                loadFromDb.map(r => ({
                    id: keyRecordFunc(r),
                    data: r,
                    options: { ttl }
                }))
            );

            for (let row of loadFromDb) {
                cached[keyRecordFunc(row)] = row;
            }
        }

        return ids.map(id => {
            const val = cached[keyFunc(id)];
            if (typeof(val) === "string") { return JSON.parse(val); }

            return val;
        });
    };
}
