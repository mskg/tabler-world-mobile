import { KeyValueCache } from "apollo-server-core";
import { ILogger } from "../types/ILogger";

export async function writeThrough<T>(
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
        ttl ? { ttl } : undefined
    );

    return result;
}
