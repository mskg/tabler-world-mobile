import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { DynamoDBCache } from '@mskg/tabler-world-cache';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { Environment } from '../Environment';

let instance: DynamoDBCache;

// tslint:disable-next-line: export-name
export function createDynamoDBCache() {
    if (!instance) {
        instance = new DynamoDBCache(
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
            new ConsoleLogger('cache'),
        );
    }

    return instance;
}
