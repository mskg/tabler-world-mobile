import { CacheData, CacheValues, IManyKeyValueCache } from "@mskg/tabler-world-cache";
import { KeyValueCache } from 'apollo-server-core';

// we still support the query cache
export class NoCache implements KeyValueCache<string>, IManyKeyValueCache<string> {
    cache: { [key: string]: string } = {};

    public async set(
        id: string,
        data: string,
        _options?: { ttl?: number },
    ) {
        this.cache[id] = data;
    }

    public async delete(id: string): Promise<boolean | void> {
        delete this.cache[id];
    }

    public async getMany(ids: string[]): Promise<CacheValues> {
        return ids.reduce((p: any, c: string) => {
            const v = this.get(c);
            if (v) {
                p[c] = v;
            }

            return p;
        }, {});
    }

    public async setMany(data: CacheData<string>[]): Promise<void> {
        data.forEach(d =>
            this.cache[d.id] = d.data
        );
    }

    public async get(
        id: string): Promise<string | undefined> {
        return this.cache[id];
    }
}