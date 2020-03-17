import { IORedisClient } from '@mskg/tabler-world-cache';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { ioRedis } from './ioRedis';

export const ioRedisClient = new IORedisClient(
    ioRedis,
    new ConsoleLogger('redis:storage'),
);
