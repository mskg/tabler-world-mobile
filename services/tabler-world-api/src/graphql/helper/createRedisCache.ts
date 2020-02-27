import { RedisCache } from '@mskg/tabler-world-cache';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { Environment } from '../Environment';
import { createIORedisConnection } from './createIORedisConnection';

let instance: RedisCache;

// tslint:disable-next-line: export-name
export function createRedisCache() {
    if (!instance) {
        instance = new RedisCache(
            createIORedisConnection(),
            {
                timeout: Environment.Redis.cacheTimeout,
                prefix: `${Environment.Caching.version}:`,
                maxTTL: Environment.Redis.maxTTL
                    ? parseInt(Environment.Redis.maxTTL, 10)
                    : Infinity,
            },
            new ConsoleLogger('cache'),
        );
    }

    return instance;
}
