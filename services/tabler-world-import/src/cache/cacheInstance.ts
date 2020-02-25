import { Environment } from '../Environment';
import { dynamoDB } from './dynamoDB';
import { NoCache } from './NoCache';
import { redisCache } from './redisCache';

export const cacheInstance = Environment.Caching.disabled
    ? new NoCache()
    : Environment.Caching.useRedis
        ? redisCache
        : dynamoDB;
