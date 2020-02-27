import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { RedisCache } from '@mskg/tabler-world-cache';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { ClientOpts } from 'redis';
import { Environment } from '../Environment';

export const redisConfig: ClientOpts = {
    prefix: `${Environment.stageName}:${Environment.Caching.version}:`,

    host: Environment.Redis.host,
    port: Environment.Redis.port,

    connect_timeout: Environment.Redis.timeout,
    retry_strategy: (options) => {
        return Math.min(options.attempt * 100, 3000);
    },

    tls: EXECUTING_OFFLINE
        ? undefined
        : {
            checkServerIdentity: () => {
                // skip certificate hostname validation
                return undefined;
            },
        },
};

export function createRedisCache() {
    return new RedisCache(
        redisConfig,
        {
            maxTTL: Environment.Redis.maxTTL
                ? parseInt(Environment.Redis.maxTTL, 10)
                : Infinity,
        },
        new ConsoleLogger('RedisCache'),
    );
}