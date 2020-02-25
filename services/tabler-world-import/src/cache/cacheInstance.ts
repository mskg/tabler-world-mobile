import { DynamoDBCache } from '@mskg/tabler-world-cache';
import { ConsoleLogger } from '@mskg/tabler-world-common';

export const cacheInstance = new DynamoDBCache(
    {
        region: process.env.AWS_REGION,
    },
    {
        tableName: process.env.cache_table as string,
    },
    process.env.cache_version,
    new ConsoleLogger('DynamoDBCache'),
);
