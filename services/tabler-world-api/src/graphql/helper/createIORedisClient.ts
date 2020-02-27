import { IORedisClient } from '@mskg/tabler-world-cache';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { createIORedisConnection } from './createIORedisConnection';

let instance: IORedisClient;

export function createIORedisClient() {
    if (!instance) {
        instance = new IORedisClient(
            createIORedisConnection(),
            new ConsoleLogger('redis:store'),
        );
    }

    return instance;
}
