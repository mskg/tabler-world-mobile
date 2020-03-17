import { RedisCache } from '@mskg/tabler-world-cache';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { Environment } from '../Environment';
import { ioRedis } from './ioRedis';

export const redisCache = new RedisCache(
    ioRedis,
    {
        prefix: `${Environment.Caching.version}:`,
        maxTTL: Environment.Redis.maxTTL
            ? parseInt(Environment.Redis.maxTTL, 10)
            : Infinity,
    },
    new ConsoleLogger('RedisCache'),
);
