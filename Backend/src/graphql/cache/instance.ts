import { DynamoDBCache } from "./DynamoDBCache";
import { NoCache } from "./NoCache";

const disableCache = process.env.DISABLE_CACHE === "true";
export const cacheInstance = disableCache ? new NoCache() : new DynamoDBCache(
    {
        region: process.env.AWS_REGION,
        endpoint:
            process.env.IS_OFFLINE === 'true'
                ? 'http://localhost:8000'
                : undefined
    },
    {
        tableName: process.env.cache_table || 'typescript',
        ttl: 0
    }
);
