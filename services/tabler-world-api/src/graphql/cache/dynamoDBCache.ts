import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { DynamoDBCache } from '@mskg/tabler-world-cache';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { Environment } from '../Environment';

// tslint:disable-next-line: export-name
export function createDynamoDBCache() {
    return new DynamoDBCache(
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
}