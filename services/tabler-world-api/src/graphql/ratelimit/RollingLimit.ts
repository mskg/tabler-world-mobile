import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { IORedisClient } from '@mskg/tabler-world-cache';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { bool } from 'aws-sdk/clients/signer';
import { IRateLimiter, LimitResult } from './IRateLimiter';
import luaScript from './limit.json';

type Options = {
    redis: IORedisClient,

    /**
     * Prefix
     */
    name?: string,

    limit: number,
    intervalMS: number;

    /**
     * Accept request but drain limit
     */
    force?: boolean,
};

const logger = new ConsoleLogger('rate');

/**
 * Credits to https://github.com/BitMEX/node-redis-token-bucket-ratelimiter
 * Rewritten for ioredit, typescript
 */
export class RollingLimit implements IRateLimiter {
    name?: string;
    force: bool;
    interval: number;
    limit: number;
    redis: IORedisClient;

    constructor(options: Options) {
        this.interval = options.intervalMS;
        this.limit = options.limit;
        this.redis = options.redis;
        this.force = options.force ?? false;
        // tslint:disable-next-line: prefer-template
        this.name = options.name ? options.name + ':' : '';
    }

    use(id: string | number, amount: number = 1): Promise<LimitResult> {
        return Promise.resolve()
            .then(() => {
                if (amount < 0) throw new Error('amount must be >= 0');
                if (amount > this.limit) throw new Error(`amount must be < limit (${this.limit})`);

                // Note extra curly braces (hash tag) which are needed for Cluster hash slotting
                const keyBase = `ratelimit:{${this.name}${id}}`;
                const valueKey = `${keyBase}:v`;
                const timestampKey = `${keyBase}:t`;

                // A note on redis EVAL:
                // It may seem nosensical for us to specify keys separate from args, but this is a way of letting
                // Redis know what keys we intend to operate on. By doing so, it can work with Cluster. From the docs:
                //
                // > All Redis commands must be analyzed before execution to determine which keys the command will operate on.
                // > In order for this to be true for EVAL, keys must be passed explicitly. This is useful in many ways,
                // > but especially to make sure Redis Cluster can forward your request to the appropriate cluster node.
                //
                // What is not stated, and is necessary to know, is that we *must* ensure all keys we operate on
                // are on the same server by using hash tags. All this key passing does is allow Redis to do is fail properly.
                //
                // https://redis.io/commands/eval
                //
                const redisKeysAndArgs = [
                    valueKey,               // KEYS[1]
                    timestampKey,           // KEYS[2]
                    this.limit,             // ARGV[1]
                    this.interval,          // ARGV[2]
                    amount,                 // ARGV[3]
                    this.force.toString(),  // ARGV[4]
                ];

                // @ ts-ignore
                return this.redis.evalsha(luaScript.sha1, 2, ...redisKeysAndArgs)
                    .catch((err: any) => {
                        if (err instanceof Error && err.message.includes('NOSCRIPT')) {
                            // Script is missing, invoke again while providing the entire script
                            return this.redis.eval(luaScript.script, 2, ...redisKeysAndArgs);
                        }
                        // Other error
                        throw err;
                    })
                    .then((res) => {
                        const result = {
                            limit: this.limit,
                            remaining: res[0],
                            rejected: Boolean(res[1]),
                            retryDelta: res[2],
                            forced: Boolean(res[3]),
                        };

                        if (result.rejected || EXECUTING_OFFLINE) {
                            logger.log(this.name, id, result);
                        }

                        return result;
                    });
            });
    }
}

