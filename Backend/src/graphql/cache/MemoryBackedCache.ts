import { KeyValueCache } from "apollo-server-caching";
import LRU from 'lru-cache';
import { CacheData, CacheValues, IManyKeyValueCache } from "./CacheTypes";
import { TTLs } from "./TTLs";

/**
 * Cache invalidation is a global engineering problem. The whole DynamoDB implementation should be changed to
 * MemCached/Redis once the App starts scaling. This is just a(n) (acceptable) workarround to reduce load/cost.
 */
export class MemoryBackedCache implements KeyValueCache<string>, IManyKeyValueCache<string> {
    memoryCache = new LRU<string, string>({
        max: parseInt(process.env.MEMORY_CACHE_SIZE || (128 * 1000 * 1000).toString(), 10),
        maxAge: TTLs.Memory * 1000,
    });

    constructor(private innerCache: KeyValueCache<string> & IManyKeyValueCache<string>) {
        console.debug("[MemoryBackedCache] init");
    }

    async get(key: string): Promise<string | undefined> {
        console.debug("[MemoryBackedCache] get", key);

        let cached = this.memoryCache.get(key);
        if (cached) {
            return cached;
        }

        cached = await this.innerCache.get(key);
        if (cached) {
            console.debug("[MemoryBackedCache] updating store", key);

            // we could extend the value by TTLS.Memoy here, but we live with that
            // we don't wait for it
            this.memoryCache.set(key, cached);
        }

        return cached;
    }

    async set(key: string, value: string, options?: { ttl?: number | undefined; } | undefined): Promise<void> {
        console.debug("[MemoryBackedCache] set ", key, options);

        this.memoryCache.set(key, value);

        // we don't wait for it
        this.innerCache.set(key, value, options);
    }

    async delete(key: string): Promise<boolean | void> {
        console.debug("[MemoryBackedCache] delete ", key);

        this.memoryCache.del(key);

        // we don't wait for it
        this.innerCache.delete(key);
    }

    async getMany(ids: string[]): Promise<CacheValues> {
        console.debug("[MemoryBackedCache] getMany", ids);

        // check memory first
        let missingKeys: string[] = [];
        const result = ids.reduce((p, id) => {
            const val = this.memoryCache.get(id);

            if (val != null) {
                p[id] = val;
            } else {
                missingKeys.push(id);
            }

            return p;
        }, {} as CacheValues);

        // check backend
        if (missingKeys.length > 0) {
            console.debug("[MemoryBackedCache] missed keys", missingKeys);

            const missing = await this.innerCache.getMany(missingKeys);
            const foundMissingKeys = Object.keys(missing);

            if (foundMissingKeys.length > 0) {
                console.debug("[MemoryBackedCache] updating store", foundMissingKeys);

                // write through missing keys
                foundMissingKeys.forEach(
                    (id) => {
                        this.memoryCache.set(id, missing[id]);
                    }
                );
            }

            return {
                ...result,
                ...missing,
            }
        }

        return result;
    }

    async setMany(data: CacheData<string>[]): Promise<void> {
        data.forEach(
            d => this.memoryCache.set(d.id, d.data)
        );

        // we don't wait for it
        this.innerCache.setMany(data);
    }
}
