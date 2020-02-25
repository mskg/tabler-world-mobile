// tslint:disable-next-line: variable-name
export const Environment = {
    AWS: {
        Region: process.env.AWS_REGION,
    },

    Caching: {
        disabled: process.env.DISABLE_CACHE === 'true',
        useRedis: process.env.USE_REDIS !== 'false',
        version: process.env.cache_version,
    },

    stageName: process.env.STAGE,

    Redis: {
        host: process.env.REDIS_DEBUG_HOST || process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        timeout: 2147483647,
        maxTTL: process.env.REDIS_MAXTTL,
    },

    DynamoDB: {
        table: process.env.cache_table,
        defautTTL: parseInt(process.env.TTL_DEFAULT || (60 * 60 * 24 * 2).toString(), 10),
    },
};
