import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { DynamoDBCache, MemoryBackedCache } from '@mskg/tabler-world-cache';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { NoCache } from './NoCache';
import { DEFAULT_TTL } from './TTLs';

const disableCache = process.env.DISABLE_CACHE === 'true';
export const cacheInstance = disableCache
    ? new NoCache()
    : new MemoryBackedCache(
        new DynamoDBCache(
            {
                region: process.env.AWS_REGION,
                endpoint:
                    EXECUTING_OFFLINE
                        ? 'http://localhost:8000'
                        : undefined,
            },
            {
                tableName: EXECUTING_OFFLINE ? 'tabler-world-cache-dev' : process.env.cache_table as string,
                ttl: DEFAULT_TTL,
            },
            EXECUTING_OFFLINE ? 'dev' : process.env.cache_version,
            new ConsoleLogger('DynamoDBCache'),
        ),
        new ConsoleLogger('MemoryBackedCache'),
    );
