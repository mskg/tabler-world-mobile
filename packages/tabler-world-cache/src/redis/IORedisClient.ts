import { keys as loadashKeys } from 'lodash';
import { IORedisBaseClient } from './IORedisBaseClient';
import { MultiCommand } from './MultiCommand';

// tslint:disable-next-line: max-classes-per-file
export class IORedisClient extends IORedisBaseClient {
    public async multi(): Promise<MultiCommand> {
        return new MultiCommand(this.client.multi(), this.logger);
    }

    public set(key: string, val: any, ttl: number) {
        this.logger.log('set', key);
        return this.client.set(key, JSON.stringify(val), 'EX', ttl);
    }

    public async mget(keys: string[]): Promise<{
        [key: string]: any,
    }> {
        this.logger.log('mget', keys);

        const val = await this.client.mget(...keys);
        const result: any = {};
        keys.forEach((k, i) => {
            const v = val[i];

            if (v) {
                result[k] = JSON.parse(v as string);
            }
        });

        return result;
    }

    public hlen(hash: string): Promise<number> {
        this.logger.log('hlen', hash);
        return this.client.hlen(hash);
    }

    public async geopos(key: string, member: string): Promise<{ longitude: number, latitude: number } | undefined> {
        this.logger.log('geopos', key, member);

        // @ts-ignore Wrong types
        const val = await this.client.geopos(key, member);
        return val && val.length === 1
            ? {
                longitude: val[0][0],
                latitude: val[0][1],
            }
            : undefined;
    }

    public async get<T>(key: string): Promise<T | undefined> {
        this.logger.log('get', key);

        const val = await this.client.get(key);
        return val ? JSON.parse(val) : undefined;
    }

    public hmset(hash: string, val: { field: string, value: any }[], ttl?: number) {
        this.logger.log('hmset', hash, val.map((v) => v.field));
        return new MultiCommand(this.client.multi(), this.logger)
            .hmset(hash, val, ttl)
            .exec();
    }

    public async hgetall(hash: string): Promise<{
        [key: string]: any,
    }> {
        this.logger.log('hgetall', hash);

        const values = await this.client.hgetall(hash);
        loadashKeys(values).forEach((k) => {
            const val = values[k];
            if (val) {
                values[k] = JSON.parse(val);
            } else {
                delete values[k];
            }
        });

        return values;
    }

    public async hmget(hash: string, keys: string[]): Promise<{
        [key: string]: any,
    }> {
        this.logger.log('hmget', hash, keys);
        const values = await this.client.hmget(hash, ...keys);

        const result: any = {};
        values.forEach((v, i) => {
            result[keys[i]] = v ? JSON.parse(v) : v;
        });

        return result;
    }

    public hdel(hash: string, fields: string[]) {
        this.logger.log('hdel', hash, fields);
        return this.client.hdel(hash, ...fields);
    }

    public del(hash: string) {
        this.logger.log('del', hash);
        return this.client.del(hash);
    }

    public evalsha(scriptSha: string, numKeys: number, ...args: (string | number)[]): Promise<any> {
        this.logger.log('evalsha', scriptSha);
        return this.client.evalsha(scriptSha, numKeys.toString(), args);
    }

    // tslint:disable-next-line: no-banned-terms
    public eval(script: string, numKeys: number, ...args: (string | number)[]): Promise<any> {
        this.logger.log('eval');
        return this.client.eval(script, numKeys, args);
    }
}
