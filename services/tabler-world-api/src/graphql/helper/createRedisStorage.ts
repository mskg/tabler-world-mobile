import { ConsoleLogger } from '@mskg/tabler-world-common';
import { createIORedisConnection } from './createIORedisConnection';
import { RedisStorage } from './RedisStorage';

let instance: RedisStorage;

export function createRedisStorage() {
    if (!instance) {
        instance = new RedisStorage(
            createIORedisConnection(),
            new ConsoleLogger('redis:store'),
        );
    }

    return instance;
}
