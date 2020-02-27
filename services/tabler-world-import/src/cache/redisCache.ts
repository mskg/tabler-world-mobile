import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { RedisCache } from '@mskg/tabler-world-cache';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import IORedis from 'ioredis';
import { Environment } from '../Environment';

export const redisCache = new RedisCache(
    new IORedis({
        keyPrefix: `${Environment.stageName}:`,
        lazyConnect: true,

        connectionName: `api:${Environment.stageName}`,
        host: Environment.Redis.host,
        port: Environment.Redis.port,

        tls: EXECUTING_OFFLINE
            ? undefined
            : {
                checkServerIdentity: () => {
                    // skip certificate hostname validation
                    return undefined;
                },
            },
    }),
    {
        prefix: `${Environment.Caching.version}:`,
        maxTTL: Environment.Redis.maxTTL
            ? parseInt(Environment.Redis.maxTTL, 10)
            : Infinity,
    },
    new ConsoleLogger('RedisCache'),
);
