import { ILogger } from '@mskg/tabler-world-common';
import { KeyValueCache } from 'apollo-server-core';
import { ClientOpts, Multi } from 'redis';
import { promisify } from 'util';
import { RedisBaseClient } from '../redis/RedisBaseClient';
import { CacheData, CacheValues, ICacheOptions, IManyKeyValueCache } from './types';

type Opts = {
    maxTTL: number,
};

export class RedisCache extends RedisBaseClient implements KeyValueCache<string>, IManyKeyValueCache<string> {
    clientMulti!: () => Multi;
    clientGet!: (arg: string) => Promise<string>;
    clientDel!: (arg: string) => Promise<number>;
    clientSet!: (arg: string, arg1: string, mode?: string, duration?: number) => Promise<any>;
    clientMGet!: (arg: string[]) => Promise<any>;
    clientMSet!: (arg: string[]) => Promise<any>;

    constructor(
        opts?: ClientOpts,
        private cacheOpts: Opts = {
            maxTTL: Infinity,
        },
        logger: ILogger = console,
    ) {
        super(opts, logger);
    }

    initClient() {
        this.clientGet = promisify(this.client.get).bind(this.client);
        this.clientSet = promisify(this.client.set).bind(this.client);
        this.clientDel = promisify(this.client.del).bind(this.client);
        this.clientMGet = promisify(this.client.mget).bind(this.client);
        this.clientMSet = promisify(this.client.mset).bind(this.client);
        this.clientMulti = this.client.multi.bind(this.client);
    }

    getTTL(options?: ICacheOptions) {
        return options && options.ttl
            ? Math.min(options.ttl, this.cacheOpts.maxTTL)
            : this.cacheOpts.maxTTL;
    }

    async get(key: string): Promise<string | undefined> {
        this.logger.log('get', key);
        if (!(await this.isConnected())) {
            this.logger.log('not ready');
            return undefined;
        }

        return this.clientGet(key);
    }

    async set(key: string, value: string, options?: ICacheOptions): Promise<any> {
        this.logger.log('set', key, options);
        if (!(await this.isConnected())) {
            this.logger.log('not ready');
            return undefined;
        }

        return this.clientSet(
            key, value,
            'EX', this.getTTL(options),
        );
    }

    async delete(key: string): Promise<any> {
        if (!key) { return; }

        this.logger.log('delete', key);
        if (!(await this.isConnected())) {
            this.logger.log('not ready');
            return Promise.resolve(undefined);
        }

        return await this.clientDel(key) === 1;
    }

    async getMany(keys: string[]): Promise<CacheValues<string>> {
        if (!keys || keys.length === 0) { return {}; }

        this.logger.log('getMany', keys);
        if (!(await this.isConnected())) {
            this.logger.log('not ready');
            return Promise.resolve({});
        }

        const values: any[] = await this.clientMGet(keys);

        const result: any = {};
        keys.forEach((k, i) => {
            if (values[i]) {
                result[k] = values[i];
            }
        });

        return result;
    }

    async setMany(data: CacheData<string>[]): Promise<any> {
        if (!data || data.length === 0) { return; }

        this.logger.log('setMany', data.map((d) => d.id));
        if (!(await this.isConnected())) {
            this.logger.log('not ready');
            return Promise.resolve(undefined);
        }

        await this.clientMSet(data.map((d) => [d.id, d.data]).flat());

        const multi = this.clientMulti();
        data.forEach((d) => {
            multi.expire(
                d.id,
                this.getTTL(d.options),
            );
        });

        return new Promise((resolve, reject) => {
            multi.exec((err) => {
                if (err) { reject(err); }
                resolve();
            });
        });
    }
}
