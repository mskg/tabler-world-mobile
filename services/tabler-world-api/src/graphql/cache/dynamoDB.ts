import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { DynamoDBCache } from '@mskg/tabler-world-cache';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { Environment } from '../Environment';

export const dynamoDB = new DynamoDBCache(
    {
        region: Environment.AWS.Region,
        endpoint:
            EXECUTING_OFFLINE
                ? 'http://localhost:8000'
                : undefined,
    },
    {
        tableName: EXECUTING_OFFLINE ? 'tabler-world-cache-dev' : Environment.DynamoDB.table as string,
        ttl: Environment.DynamoDB.defautTTL,
    },
    EXECUTING_OFFLINE ? 'dev' : Environment.Caching.version,
    new ConsoleLogger('DynamoDBCache'),
);
