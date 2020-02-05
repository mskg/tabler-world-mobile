import { ILogger } from '@mskg/tabler-world-common';
import { KeyValueCache } from 'apollo-server-caching';
import LRU from 'lru-cache';
import { CACHE_SIZE } from './config';
import { MEMORY_TTL } from './TTLs';
import { CacheData, CacheValues, IManyKeyValueCache } from './types';

/**
 * Cache invalidation is a global engineering problem. The whole DynamoDB implementation should be changed to
 * MemCached/Redis once the App starts scaling. This is just a(n) (acceptable) workarround to reduce load/cost.
 */
export class MemoryBackedCache implements KeyValueCache<string>, IManyKeyValueCache<string> {
    private memoryCache = new LRU<string, string>({
        max: CACHE_SIZE,
        maxAge: MEMORY_TTL * 1000,
    });

    constructor(
        private innerCache: KeyValueCache<string> & IManyKeyValueCache<string>,
        private logger: ILogger = console,
    ) {
        this.logger.log('init');
    }

    public async get(key: string): Promise<string | undefined> {
        this.logger.log('get', key);

        let cached = this.memoryCache.get(key);
        if (cached) {
            return cached;
        }

        cached = await this.innerCache.get(key);
        if (cached) {
            this.logger.log('updating store', key);

            // we could extend the value by TTLS.Memoy here, but we live with that
            // we don't wait for it
            this.memoryCache.set(key, cached);
        }

        return cached;
    }

    public async set(key: string, value: string, options?: { ttl?: number | undefined; } | undefined): Promise<void> {
        this.logger.log('set ', key, options);

        this.memoryCache.set(key, value);
        await this.innerCache.set(key, value, options);
    }

    public async delete(key: string): Promise<boolean | void> {
        this.logger.log('delete ', key);

        this.memoryCache.del(key);
        await this.innerCache.delete(key);
    }

    public async getMany(ids: string[]): Promise<CacheValues<string>> {
        this.logger.log('getMany', ids);

        // check memory first
        const missingKeys: string[] = [];
        const result = ids.reduce(
            (p, id) => {
                const val = this.memoryCache.get(id);

                if (val != null) {
                    p[id] = val;
                } else {
                    missingKeys.push(id);
                }

                return p;
            },
            {} as CacheValues<string>,
        );

        // check backend
        if (missingKeys.length > 0) {
            this.logger.log('missed keys', missingKeys);

            const missing = await this.innerCache.getMany(missingKeys);
            const foundMissingKeys = Object.keys(missing);

            if (foundMissingKeys.length > 0) {
                this.logger.log('updating store', foundMissingKeys);

                // write through missing keys
                foundMissingKeys.forEach(
                    (id) => {
                        this.memoryCache.set(id, missing[id]);
                    },
                );
            }

            return {
                ...result,
                ...missing,
            };
        }

        return result;
    }

    public async setMany(data: CacheData<string>[]): Promise<void> {
        this.logger.log('setMany', data.map((d) => d.id));

        data.forEach((d) => this.memoryCache.set(d.id, d.data));
        await this.innerCache.setMany(data);
    }
}
