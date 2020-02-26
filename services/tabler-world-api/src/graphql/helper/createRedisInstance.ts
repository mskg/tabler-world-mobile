import { ConsoleLogger } from '@mskg/tabler-world-common';
import { redisConfig } from '../cache/redisCache';
import { RedisStorage } from './RedisStorage';

let instance: RedisStorage;

export function createRedisInstance() {
    if (!instance) {
        instance = new RedisStorage(
            redisConfig,
            new ConsoleLogger('RedisStorage'),
        );
    }

    return instance;
}
