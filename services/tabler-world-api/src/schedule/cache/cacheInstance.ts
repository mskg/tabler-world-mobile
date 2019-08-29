import { DynamoDBCache } from "@mskg/tabler-world-cache";

export const cache = new DynamoDBCache(
    {
        region: process.env.AWS_REGION,
    }, {
        tableName: process.env.cache_table as string,
    }
);
