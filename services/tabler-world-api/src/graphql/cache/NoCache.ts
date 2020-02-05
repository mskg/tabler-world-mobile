import { CacheValues, IManyKeyValueCache } from '@mskg/tabler-world-cache';
import { KeyValueCache } from 'apollo-server-core';

// we still support the query cache
export class NoCache implements KeyValueCache<string>, IManyKeyValueCache<string> {

    // tslint:disable-next-line: no-empty
    public async set() {
    }

    // tslint:disable-next-line: no-empty
    public async delete(): Promise<boolean | void> {
    }

    public async getMany(): Promise<CacheValues<string>> {
        return {};
    }

    // tslint:disable-next-line: no-empty
    public async setMany(): Promise<void> {
    }

    public async get(): Promise<string | undefined> {
        return undefined;
    }
}
