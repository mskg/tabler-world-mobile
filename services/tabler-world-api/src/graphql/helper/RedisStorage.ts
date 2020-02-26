import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { RedisBaseClient } from '@mskg/tabler-world-cache';
import { ILogger } from '@mskg/tabler-world-common';
import { keys as loadashKeys } from 'lodash';
import { ClientOpts, Multi } from 'redis';

class MultiCommand {
    private cmds = 0;

    public get numerOfCommands() { return this.cmds; }

    constructor(private multi: Multi, private dumpResults: boolean, private logger: ILogger) {
    }

    public set(key: string, val: any, ttl?: number): this {
        this.logger.log('multi:set', key);
        this.cmds += 1;

        if (ttl) {
            this.multi = this.multi.set(key, JSON.stringify(val), 'EX', ttl);
        } else {
            this.multi = this.multi.set(key, JSON.stringify(val));
        }

        return this;
    }

    public hmset(hash: string, val: { field: string, value: any }[], ttl?: number) {
        this.logger.log('multi:hmset', hash, val.map((v) => v.field));
        this.cmds += 1;

        this.multi = this.multi.hmset(hash, val.map((v) => [v.field, JSON.stringify(v.value)]).flat());

        if (ttl) {
            this.cmds += 1;
            this.multi = this.multi.expire(hash, ttl);
        }

        return this;
    }

    public georadiusbymember(set: string, key: string, distance: number, store: string) {
        this.logger.log('multi:georadiusbymember', set, key, distance, store);
        this.cmds += 1;

        this.multi = this.multi.georadiusbymember(set, key, distance, 'km', 'STOREDIST', store);
        return this;
    }

    public zinterstore(set: string, set1: string, set2: string, weight1: number, weight2: number) {
        this.logger.log('multi:zinterstore', set, set1, set2, weight1, weight2);
        this.cmds += 1;

        this.multi = this.multi.zinterstore(set, 2, set1, set2, 'WEIGHTS', weight1, weight2);
        return this;
    }

    public zrangebyscore(set: string, start: number, limit: number) {
        this.logger.log('multi:zrangebyscore', set, start, limit);
        this.cmds += 1;

        this.multi = this.multi.zrangebyscore(set, start, '+inf', 'WITHSCORES', 'LIMIT', 0, limit);
        return this;
    }

    public zrange(set: string, start: number, stop: number) {
        this.logger.log('multi:zrange', set, start, stop);
        this.cmds += 1;

        this.multi = this.multi.zrange(set, start, stop, 'WITHSCORES');
        return this;
    }

    public zremrangebyscore(set: string, min: number | string, max: number | string) {
        this.logger.log('multi:zremrangebyscore', set, min, max);
        this.cmds += 1;

        this.multi = this.multi.zremrangebyscore(set, min, max);
        return this;
    }

    public zadd(set: string, rank: number, member: string) {
        this.logger.log('multi:zadd', set, rank, member);
        this.cmds += 1;

        this.multi = this.multi.zadd(set, rank, member);
        return this;
    }

    public geoadd(key: string, longitude: number, latitude: number, member: string) {
        this.logger.log('multi:geoadd', key, longitude, latitude, member);
        this.cmds += 1;

        this.multi = this.multi.geoadd(key, longitude, latitude, member);
        return this;
    }

    public hdel(hash: string, fields: string[]) {
        this.logger.log('multi:hdel', hash, fields);
        this.cmds += 1;

        this.multi = this.multi.hdel(hash, fields);
        return this;
    }

    public del(key: string) {
        this.logger.log('multi:del', key);
        this.cmds += 1;

        this.multi = this.multi.del(key);
        return this;
    }

    public async exec(): Promise<any[]> {
        this.logger.log('multi:exec');
        return new Promise((resolve, reject) => {
            this.multi.exec((err, val) => {
                if (err) { reject(err); }
                if (this.dumpResults) { this.logger.log(val); }

                resolve(val);
            });
        });
    }
}

// tslint:disable-next-line: max-classes-per-file
export class RedisStorage extends RedisBaseClient {
    private dumpResults = false && EXECUTING_OFFLINE;

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
        return new MultiCommand(this.client.multi(), this.dumpResults, this.logger);
    }

    public async set(key: string, val: any, ttl: number) {
        this.logger.log('set', key);
        await this.ensureConnected();

        return new Promise((resolve, reject) => {
            this.client.set(key, JSON.stringify(val), 'EX', ttl, (err, val) => {
                if (err) { reject(err); }
                if (this.dumpResults) { this.logger.log(val); }

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
                if (this.dumpResults) { this.logger.log(val); }

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
                if (this.dumpResults) { this.logger.log(val); }

                resolve(val);
            });
        });
    }

    public async geopos(key: string, member: string): Promise<{ longitude: number, latitude: number } | undefined> {
        this.logger.log('geopos', key, member);
        await this.ensureConnected();

        return new Promise((resolve, reject) => {
            this.client.geopos(key, member, (err, val) => {
                if (err) { reject(err); }
                if (this.dumpResults) { this.logger.log(val); }

                resolve(
                    val && val.length === 1
                        ? {
                            longitude: val[0][0],
                            latitude: val[0][1],
                        }
                        : undefined,
                );
            });
        });
    }

    public async get<T>(key: string): Promise<T | undefined> {
        this.logger.log('get', key);
        await this.ensureConnected();

        return new Promise((resolve, reject) => {
            this.client.get(key, (err, val) => {
                if (err) { reject(err); }
                if (this.dumpResults) { this.logger.log(val); }

                resolve(val ? JSON.parse(val) : undefined);
            });
        });
    }

    public async hmset(hash: string, val: { field: string, value: any }[], ttl?: number) {
        this.logger.log('hmset', hash, val.map((v) => v.field));
        await this.ensureConnected();

        return await new MultiCommand(this.client.multi(), this.dumpResults, this.logger)
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
                if (this.dumpResults) this.logger.log(values);

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
                if (this.dumpResults) { this.logger.log(values); }

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
            this.client.hdel(hash, fields, (err, val) => {
                if (err) { reject(err); }
                if (this.dumpResults) { this.logger.log(val); }

                resolve();
            });
        });
    }

    public async del(hash: string) {
        this.logger.log('del', hash);
        await this.ensureConnected();

        return new Promise((resolve, reject) => {
            this.client.del(hash, (err, val) => {
                if (err) { reject(err); }
                if (this.dumpResults) { this.logger.log(val); }

                resolve();
            });
        });
    }
}
