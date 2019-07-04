import { DynamoDBCache } from "./DynamoDBCache";
import { MemoryBackedCache } from "./MemoryBackedCache";
import { NoCache } from "./NoCache";
import { TTLs } from "./TTLs";

const disableCache = process.env.DISABLE_CACHE === "true";
export const cacheInstance = disableCache ? new NoCache() : new MemoryBackedCache(new DynamoDBCache(
    {
        region: process.env.AWS_REGION,
        endpoint:
            process.env.IS_OFFLINE === 'true'
                ? 'http://localhost:8000'
                : undefined
    },
    {
        tableName: process.env.cache_table as string,
        ttl: TTLs.Default
    }
));