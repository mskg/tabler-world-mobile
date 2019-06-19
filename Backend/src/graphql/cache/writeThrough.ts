import { KeyValueCache } from "apollo-server-core";
import { ILogger } from "../types/ILogger";

async function writeThroughCache<T>(
    context: {
        cache: KeyValueCache<string>,
        logger: ILogger,
    },

    key: string,
    resolver: () => Promise<T>,
    ttl?: number
): Promise<T> {
    const cached = await context.cache.get(key);

    if (cached != null && typeof(cached) === "string") {
        context.logger.log("cache hit", key);

        if (cached.startsWith("raw:")) return cached.substr(4) as unknown as T;
        return JSON.parse(cached);
    }

    const result = await resolver();
    // console.log("Result", key, result);

    const resultSerialized = typeof(result) === "string" ? ("raw:" + result) : JSON.stringify(result);
    context.logger.log(key, "cache size", resultSerialized.length);

    context.cache.set(
        key,
        resultSerialized,
        ttl ? { ttl: Math.floor(Date.now() / 1000) + ttl } : undefined
    );

    return result;
}

async function noCache<T>(
    _context: {
        cache: KeyValueCache<string>,
        logger: ILogger,
    },

    _key: string,
    resolver: () => Promise<T>,
    _ttl?: number
): Promise<T> {
    return await resolver();
}

const disableCache = process.env.DISABLE_CACHE === "true";
export const writeThrough = disableCache ? noCache : writeThroughCache;
