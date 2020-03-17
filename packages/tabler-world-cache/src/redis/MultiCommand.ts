import { ILogger } from '@mskg/tabler-world-common';
import { Pipeline } from 'ioredis';

export class MultiCommand {
    private cmds = 0;

    public get numerOfCommands() { return this.cmds; }

    constructor(
        private pipeline: Pipeline,
        private logger: ILogger,
    ) {
    }

    public set(key: string, val: any, ttl?: number): this {
        this.logger.debug('multi:set', key);
        this.cmds += 1;

        if (ttl) {
            this.pipeline = this.pipeline.set(key, JSON.stringify(val), 'EX', ttl);
        } else {
            this.pipeline = this.pipeline.set(key, JSON.stringify(val));
        }

        return this;
    }

    public hmget(hash: string, keys: string[]): this {
        this.logger.debug('hmget', hash, keys);
        this.pipeline = this.pipeline.hmget(hash, ...keys);

        return this;
    }

    public hmset(hash: string, val: { field: string, value: any }[], ttl?: number) {
        this.logger.debug('multi:hmset', hash, val.map((v) => v.field));
        this.cmds += 1;

        this.pipeline = this.pipeline.hmset(hash, val.map((v) => [v.field, JSON.stringify(v.value)]).flat());

        if (ttl) {
            this.cmds += 1;
            this.pipeline = this.pipeline.expire(hash, ttl);
        }

        return this;
    }

    public georadiusbymemberStoreDistance(set: string, key: string, distance: number, unit: string, store: string) {
        this.logger.debug('multi:georadiusbymember', set, key, distance, store);
        this.cmds += 1;

        // @ts-ignore Error in types, and an error preventing the key from beeing prefixed
        this.pipeline = this.pipeline.georadiusbymember(set, key, distance, unit, 'STOREDIST', `${this.pipeline.options.keyPrefix}${store}`);
        return this;
    }

    public georadiusbymemberStoreLocation(set: string, key: string, distance: number, unit: string, store: string) {
        this.logger.debug('multi:georadiusbymember', set, key, distance, store);
        this.cmds += 1;

        // @ts-ignore Error in types, and an error preventing the key from beeing prefixed
        this.pipeline = this.pipeline.georadiusbymember(set, key, distance, unit, 'STORE', `${this.pipeline.options.keyPrefix}${store}`);
        return this;
    }

    public zinterstore(set: string, set1: string, set2: string, weight1: number, weight2: number) {
        this.logger.debug('multi:zinterstore', set, set1, set2, weight1, weight2);
        this.cmds += 1;

        this.pipeline = this.pipeline.zinterstore(set, 2, set1, set2, 'WEIGHTS', weight1.toString(), weight2.toString());
        return this;
    }

    public zrangebyscore(set: string, start: number, limit: number) {
        this.logger.debug('multi:zrangebyscore', set, start, limit);
        this.cmds += 1;

        this.pipeline = this.pipeline.zrangebyscore(set, start, '+inf', 'WITHSCORES', 'LIMIT', '0', limit.toString());
        return this;
    }

    public zrange(set: string, start: number, stop: number) {
        this.logger.debug('multi:zrange', set, start, stop);
        this.cmds += 1;

        this.pipeline = this.pipeline.zrange(set, start, stop, 'WITHSCORES');
        return this;
    }

    public zremrangebyscore(set: string, min: number | string, max: number | string) {
        this.logger.debug('multi:zremrangebyscore', set, min, max);
        this.cmds += 1;

        this.pipeline = this.pipeline.zremrangebyscore(set, min, max);
        return this;
    }

    public zadd(set: string, rank: number, member: string) {
        this.logger.debug('multi:zadd', set, rank, member);
        this.cmds += 1;

        this.pipeline = this.pipeline.zadd(set, rank.toString(), member);
        return this;
    }

    public zrem(set: string, ...member: string[]) {
        this.logger.debug('multi:zrem', set, member);
        this.cmds += 1;

        this.pipeline = this.pipeline.zrem(set, ...member);
        return this;
    }

    public geoadd(key: string, longitude: number, latitude: number, member: string) {
        this.logger.debug('multi:geoadd', key, longitude, latitude, member);
        this.cmds += 1;

        // @ts-ignore Error in types
        this.pipeline = this.pipeline.geoadd(key, longitude.toString(), latitude.toString(), member);
        return this;
    }

    public hdel(hash: string, fields: string[]) {
        this.logger.debug('multi:hdel', hash, fields);
        this.cmds += 1;

        this.pipeline = this.pipeline.hdel(hash, ...fields);
        return this;
    }

    public del(...key: string[]) {
        this.logger.debug('multi:del', key);
        this.cmds += 1;

        this.pipeline = this.pipeline.del(...key);
        return this;
    }

    public async exec(): Promise<any[]> {
        this.logger.debug('multi:exec');
        return this.pipeline.exec();
    }
}
