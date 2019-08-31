import { Param_TTLS } from "@mskg/tabler-world-config";
import { remove } from "lodash";
import { ILogger } from "./ILogger";
import { TTLs } from "./TTLs";
import { DefaultCacheType } from "./types";

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
    { cache, logger }: { cache: DefaultCacheType, logger: ILogger },
    keyFunc: MakeKeyFunc<K>,
    keyRecordFunc: KeyFromRecordFunc,
    loadFunc: LoadFunc<K>,
    ttl: keyof Param_TTLS,
): LoadFunc<K> {

    return async (ids: K[]) => {
        logger.log("[cachedDataLoader]", "loading", ids);

        const cached = await cache.getMany(
            ids.map((id) => keyFunc(id)),
        );

        const existing = Object.keys(cached);
        const missing = [...ids];
        remove(missing, (id) => existing.find((e) => e === keyFunc(id)));

        if (missing.length > 0) {
            logger.log("[cachedDataLoader]", "missing keys", missing);

            const loadFromDb: any[] = await loadFunc(missing);
            const ttls = await TTLs();

            // update cache with fresh data
            await cache.setMany(
                loadFromDb.map((r) => ({
                    id: keyRecordFunc(r),
                    data: JSON.stringify(r),
                    options: { ttl: ttls[ttl] },
                })),
            );

            for (const row of loadFromDb) {
                cached[keyRecordFunc(row)] = row;
            }
        }

        return ids.map((id) => {
            const val = cached[keyFunc(id)];
            if (typeof (val) === "string") { return JSON.parse(val); }

            return val;
        });
    };
}
