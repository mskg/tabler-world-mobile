import { KeyValueCache } from 'apollo-server-core';

// we still support the query cache
export class NoCache implements KeyValueCache<string> {
    cache: {[key: string]: string} = {};

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

    public async get(
        id: string): Promise<string | undefined> {
        return this.cache[id];
    }
}