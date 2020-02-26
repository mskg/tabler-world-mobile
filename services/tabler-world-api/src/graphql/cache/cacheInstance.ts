import { Environment } from '../Environment';
import { createDynamoDBCache } from './dynamoDBCache';
import { NoCache } from './NoCache';
import { createRedisCache } from './redisCache';

export const cacheInstance = Environment.Caching.disabled
    ? new NoCache()
    : Environment.Caching.useRedis
        ? createRedisCache()
        : createDynamoDBCache();
