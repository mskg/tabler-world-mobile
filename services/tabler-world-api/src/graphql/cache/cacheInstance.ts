import { Environment } from '../Environment';
import { createDynamoDBCache } from '../helper/createDynamoDBCache';
import { NoCache } from './NoCache';
import { createRedisCache } from '../helper/createRedisCache';

export const cacheInstance = Environment.Caching.disabled
    ? new NoCache()
    : Environment.Caching.useRedis
        ? createRedisCache()
        : createDynamoDBCache();
