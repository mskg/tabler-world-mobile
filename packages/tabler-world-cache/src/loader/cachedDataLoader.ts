import { ILogger } from '@mskg/tabler-world-common';
import { Param_TTLS } from '@mskg/tabler-world-config';
import { remove } from 'lodash';
import { TTLs } from '../cache/TTLs';
import { CacheValues, DefaultCacheType } from '../cache/types';

type CacheKeyType = string;

type MakeKeyFunc<K> = (key: K) => CacheKeyType;
type KeyFromRecordFunc<K> = (record: any, id: K) => CacheKeyType;
type LoadFunc<K> = (ids: ReadonlyArray<K>) => Promise<any[]>;

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
    keyRecordFunc: KeyFromRecordFunc<K>,
    loadFunc: LoadFunc<K>,
    ttl: keyof Param_TTLS,
): LoadFunc<K> {
    return async (ids: ReadonlyArray<K>) => {
        logger.debug('[cachedDataLoader]', 'loading', ids);

        let cached: CacheValues<string>;

        try {
            cached = await cache.getMany(
                ids.map((id) => keyFunc(id)),
            );
        } catch (e) {
            cached = {};
            logger.warn('cache failed', e);
        }

        const existing = Object.keys(cached);
        const missing = [...ids];
        remove(missing, (id) => existing.find((e) => e === keyFunc(id)));

        if (missing.length > 0) {
            logger.debug('[cachedDataLoader]', 'missing keys', missing);

            const loadFromDb: any[] = await loadFunc(missing);
            if (loadFromDb && loadFromDb.length > 0) {
                loadFromDb.forEach((row, i) => {
                    cached[keyRecordFunc(row, missing[i])] = row;
                });

                try {
                    const ttls = await TTLs();

                    // update cache with fresh data
                    await cache.setMany(
                        loadFromDb.map((r, i) => ({
                            id: keyRecordFunc(r, missing[i]),
                            data: JSON.stringify(r),
                            options: { ttl: ttls[ttl] },
                        })),
                    );

                } catch (e) {
                    logger.warn('cache set failed', e);
                }
            }
        }

        return ids.map((id) => {
            const val = cached[keyFunc(id)];
            if (typeof (val) === 'string') { return JSON.parse(val); }

            return val;
        });
    };
}
