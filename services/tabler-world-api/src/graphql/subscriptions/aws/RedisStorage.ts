import { RedisBaseClient } from '@mskg/tabler-world-cache';
import { ILogger } from '@mskg/tabler-world-common';
import { keys as loadashKeys } from 'lodash';
import { ClientOpts, Multi } from 'redis';

class MultiCommand {
    constructor(private multi: Multi, private logger: ILogger) {
    }

    public set(key: string, val: any, ttl: number): this {
        this.logger.log('multi:set', key);
        this.multi = this.multi.set(key, JSON.stringify(val), 'EX', ttl);
        return this;
    }

    public hmset(hash: string, val: { field: string, value: any }[], ttl?: number) {
        this.logger.log('multi:hmset', hash, val.map((v) => v.field));
        this.multi = this.multi.hmset(hash, val.map((v) => [v.field, JSON.stringify(v.value)]).flat());

        if (ttl) {
            this.multi = this.multi.expire(hash, ttl);
        }

        return this;
    }

    public hdel(hash: string, fields: string[]) {
        this.logger.log('multi:hdel', hash, fields);
        this.multi = this.multi.hdel(hash, fields);
        return this;
    }

    public del(key: string) {
        this.logger.log('multi:del', key);
        this.multi = this.multi.del(key);
        return this;
    }

    public async exec() {
        this.logger.log('multi:exec');
        return new Promise((resolve, reject) => {
            this.multi.exec((err) => {
                if (err) { reject(err); }
                resolve();
            });
        });
    }
}

// tslint:disable-next-line: max-classes-per-file
export class RedisStorage extends RedisBaseClient {
    constructor(
        opts?: ClientOpts,
        logger: ILogger = console,
    ) {
        super(opts, logger);
        this.connect();
    }

    // tslint:disable-next-line: no-empty
    initClient() { }

    public async multi(): Promise<MultiCommand> {
        await this.ensureConnected();
        return new MultiCommand(this.client.multi(), this.logger);
    }

    public async set(key: string, val: any, ttl: number) {
        this.logger.log('set', key);
        await this.ensureConnected();

        return new Promise((resolve, reject) => {
            this.client.set(key, JSON.stringify(val), 'EX', ttl, (err) => {
                if (err) { reject(err); }
                resolve();
            });
        });
    }

    public async mget(keys: string[]): Promise<{
        [key: string]: any,
    }> {
        this.logger.log('mget', keys);
        await this.ensureConnected();

        return new Promise((resolve, reject) => {
            this.client.mget(keys, (err, val) => {
                if (err) { reject(err); }

                const result: any = {};
                keys.forEach((k, i) => result[k] = val[i] ? JSON.parse(val[i]) : val);
                resolve(result);
            });
        });
    }

    public async hlen(hash: string): Promise<number> {
        this.logger.log('hlen', hash);
        await this.ensureConnected();

        return new Promise((resolve, reject) => {
            this.client.hlen(hash, (err, val) => {
                if (err) { reject(err); }
                resolve(val);
            });
        });
    }

    public async get<T>(key: string): Promise<T | undefined> {
        this.logger.log('get', key);
        await this.ensureConnected();

        return new Promise((resolve, reject) => {
            this.client.get(key, (err, val) => {
                if (err) { reject(err); }
                resolve(val ? JSON.parse(val) : undefined);
            });
        });
    }

    public async hmset(hash: string, val: { field: string, value: any }[], ttl?: number) {
        this.logger.log('hmset', hash, val.map((v) => v.field));
        await this.ensureConnected();

        return await new MultiCommand(this.client.multi(), this.logger)
            .hmset(hash, val, ttl)
            .exec();
    }

    public async hgetall(hash: string): Promise<{
        [key: string]: any,
    }> {
        this.logger.log('hgetall', hash);
        await this.ensureConnected();

        return new Promise((resolve, reject) => {
            this.client.hgetall(hash, (err, values) => {
                if (err) { reject(err); }

                loadashKeys(values).forEach((k) => {
                    const val = values[k];
                    if (val) {
                        values[k] = JSON.parse(val);
                    } else {
                        delete values[k];
                    }
                });

                resolve(values);
            });
        });
    }

    public async hmget(hash: string, keys: string[]): Promise<{
        [key: string]: any,
    }> {
        this.logger.log('hmget', hash, keys);
        await this.ensureConnected();

        return new Promise((resolve, reject) => {
            this.client.hmget(hash, keys, (err, values) => {
                if (err) { reject(err); }

                const result: any = {};
                values.forEach((v, i) => {
                    result[keys[i]] = v ? JSON.parse(v) : v;
                });

                resolve(result);
            });
        });
    }

    public async hdel(hash: string, fields: string[]) {
        this.logger.log('hdel', hash, fields);
        await this.ensureConnected();

        return new Promise((resolve, reject) => {
            this.client.hdel(hash, fields, (err) => {
                if (err) { reject(err); }
                resolve();
            });
        });
    }

    public async del(hash: string) {
        this.logger.log('del', hash);
        await this.ensureConnected();

        return new Promise((resolve, reject) => {
            this.client.del(hash, (err) => {
                if (err) { reject(err); }
                resolve();
            });
        });
    }
}
