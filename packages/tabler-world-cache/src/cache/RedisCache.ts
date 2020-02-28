import { ConsoleLogger, ILogger, immediate } from '@mskg/tabler-world-common';
import { KeyValueCache } from 'apollo-server-core';
import { Redis } from 'ioredis';
import { IORedisBaseClient } from '../redis/IORedisBaseClient';
import { CacheData, CacheValues, ICacheOptions, IManyKeyValueCache } from './types';

type Opts = {
    prefix?: string,
    maxTTL: number,
    timeout?: number,
};

export class RedisCache extends IORedisBaseClient implements KeyValueCache<string>, IManyKeyValueCache<string> {
    constructor(
        client: Redis,
        private cacheOpts: Opts = {
            maxTTL: Infinity,
        },
        logger: ILogger = console,
    ) {
        super(
            client,
            ConsoleLogger.extend(logger, 'redis'),
        );
    }

    getTTL(options?: ICacheOptions) {
        return options && options.ttl
            ? Math.min(options.ttl, this.cacheOpts.maxTTL)
            : this.cacheOpts.maxTTL;
    }

    mapKey(key: string): string {
        if (this.cacheOpts.prefix) {
            return `${this.cacheOpts.prefix}${key}`;
        }

        return key;
    }

    async get(key: string): Promise<string | undefined> {
        this.logger.debug('get', key);
        if (!key) { return; }

        const waitOrTimeout = this.client.get(this.mapKey(key));
        if (this.cacheOpts.timeout) {
            return await immediate(waitOrTimeout, this.cacheOpts.timeout) as unknown as string | undefined;
        }

        // will not change the API
        return await waitOrTimeout as unknown as string | undefined;
    }

    async set(key: string, value: string, options?: ICacheOptions): Promise<void> {
        this.logger.debug('set', key, options);
        await this.client.set(
            this.mapKey(key),
            value,
            'EX',
            this.getTTL(options),
        );
    }

    async delete(key: string): Promise<void> {
        this.logger.debug('delete', key);
        if (!key) { return; }
        await this.client.del(this.mapKey(key));
    }

    async getMany(keys: string[]): Promise<CacheValues<string>> {
        this.logger.debug('getMany', keys);
        if (!keys || keys.length === 0) { return {}; }

        const mappedKeys = keys.map((k) => this.mapKey(k));

        let values: (string | null)[];

        const waitOrTimeout = this.client.mget(...mappedKeys);
        if (this.cacheOpts.timeout) {
            values = await immediate(waitOrTimeout, this.cacheOpts.timeout);
        } else {
            values = await waitOrTimeout;
        }

        if (!values) { return {}; }

        const result: any = {};
        keys.forEach((k, i) => {
            const v: any = values[i];
            if (v) {
                result[k] = v;
            }
        });

        return result;
    }

    async setMany(data: CacheData<string>[]): Promise<void> {
        this.logger.debug('setMany', data.map((d) => d.id));
        if (!data || data.length === 0) { return; }

        const pipeline = this.client.multi().mset(data.map((d) => [this.mapKey(d.id), d.data]).flat());
        data.forEach((d) => {
            pipeline.expire(
                this.mapKey(d.id),
                this.getTTL(d.options),
            );
        });

        await pipeline.exec();
    }
}
