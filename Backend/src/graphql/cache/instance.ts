import { DynamoDBCache } from "../../shared/cache/DynamoDBCache";
import { MemoryBackedCache } from "../../shared/cache/MemoryBackedCache";
import { EXECUTING_OFFLINE } from "../../shared/isOffline";
import { NoCache } from "./NoCache";
import { DEFAULT_TTL } from "./TTLs";

const disableCache = process.env.DISABLE_CACHE === "true";
export const cacheInstance = disableCache ? new NoCache() : new MemoryBackedCache(new DynamoDBCache(
    {
        region: process.env.AWS_REGION,
        endpoint:
            EXECUTING_OFFLINE
                ? 'http://localhost:8000'
                : undefined
    },
    {
        tableName: process.env.cache_table as string,
        ttl: DEFAULT_TTL
    }
));