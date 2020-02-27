import { ConsoleLogger } from '@mskg/tabler-world-common';
import { redisConfig } from '../cache/redisCache';
import { Environment } from '../Environment';
import { RedisStorage } from './RedisStorage';

let instance: RedisStorage;

export function createRedisInstance() {
    if (!instance) {
        instance = new RedisStorage(
            {
                ...redisConfig,
                prefix: `${Environment.stageName}:`,
            },
            new ConsoleLogger('RedisStorage'),
        );
    }

    return instance;
}
