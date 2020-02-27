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
        this.logger.log('multi:set', key);
        this.cmds += 1;

        if (ttl) {
            this.pipeline = this.pipeline.set(key, JSON.stringify(val), 'EX', ttl);
        } else {
            this.pipeline = this.pipeline.set(key, JSON.stringify(val));
        }

        return this;
    }

    public hmset(hash: string, val: { field: string, value: any }[], ttl?: number) {
        this.logger.log('multi:hmset', hash, val.map((v) => v.field));
        this.cmds += 1;

        this.pipeline = this.pipeline.hmset(hash, val.map((v) => [v.field, JSON.stringify(v.value)]).flat());

        if (ttl) {
            this.cmds += 1;
            this.pipeline = this.pipeline.expire(hash, ttl);
        }

        return this;
    }

    public georadiusbymember(set: string, key: string, distance: number, unit: string, store: string) {
        this.logger.log('multi:georadiusbymember', set, key, distance, store);
        this.cmds += 1;

        // @ts-ignore Error in types, and an error preventing the key from beeing prefixed
        this.pipeline = this.pipeline.georadiusbymember(set, key, distance, unit, 'STOREDIST', `${this.pipeline.options.keyPrefix}${store}`);
        return this;
    }

    public zinterstore(set: string, set1: string, set2: string, weight1: number, weight2: number) {
        this.logger.log('multi:zinterstore', set, set1, set2, weight1, weight2);
        this.cmds += 1;

        this.pipeline = this.pipeline.zinterstore(set, 2, set1, set2, 'WEIGHTS', weight1.toString(), weight2.toString());
        return this;
    }

    public zrangebyscore(set: string, start: number, limit: number) {
        this.logger.log('multi:zrangebyscore', set, start, limit);
        this.cmds += 1;

        this.pipeline = this.pipeline.zrangebyscore(set, start, '+inf', 'WITHSCORES', 'LIMIT', '0', limit.toString());
        return this;
    }

    public zrange(set: string, start: number, stop: number) {
        this.logger.log('multi:zrange', set, start, stop);
        this.cmds += 1;

        this.pipeline = this.pipeline.zrange(set, start, stop, 'WITHSCORES');
        return this;
    }

    public zremrangebyscore(set: string, min: number | string, max: number | string) {
        this.logger.log('multi:zremrangebyscore', set, min, max);
        this.cmds += 1;

        this.pipeline = this.pipeline.zremrangebyscore(set, min, max);
        return this;
    }

    public zadd(set: string, rank: number, member: string) {
        this.logger.log('multi:zadd', set, rank, member);
        this.cmds += 1;

        this.pipeline = this.pipeline.zadd(set, rank.toString(), member);
        return this;
    }

    public geoadd(key: string, longitude: number, latitude: number, member: string) {
        this.logger.log('multi:geoadd', key, longitude, latitude, member);
        this.cmds += 1;

        // @ts-ignore Error in types
        this.pipeline = this.pipeline.geoadd(key, longitude.toString(), latitude.toString(), member);
        return this;
    }

    public hdel(hash: string, fields: string[]) {
        this.logger.log('multi:hdel', hash, fields);
        this.cmds += 1;

        this.pipeline = this.pipeline.hdel(hash, ...fields);
        return this;
    }

    public del(key: string) {
        this.logger.log('multi:del', key);
        this.cmds += 1;

        this.pipeline = this.pipeline.del(key);
        return this;
    }

    public async exec(): Promise<any[]> {
        this.logger.log('multi:exec');
        return this.pipeline.exec();
    }
}
