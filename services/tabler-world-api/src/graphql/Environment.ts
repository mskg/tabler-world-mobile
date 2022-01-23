// tslint:disable-next-line: variable-name
export const Environment = {
    AWS: {
        Region: process.env.AWS_REGION,
    },

    Throtteling: {
        disabled: process.env.THROTTELING_DISABLED === 'true',
        requestRateLimit: process.env.THROTTELING_RATE
            ? parseInt(process.env.THROTTELING_RATE, 10)
            : 100,

        geoRateLimit: process.env.THROTTELING_GEORATE
            ? parseInt(process.env.THROTTELING_GEORATE, 10)
            : 10,

        testPushLimit: process.env.THROTTELING_TESTPUSH
            ? parseInt(process.env.THROTTELING_TESTPUSH, 10)
            : 2,

        // websocket publish
        maxParallelDecode: parseInt(process.env.THROTTELING_WS_DECODE || '10', 10),

        // total is delivery * send
        maxParallelDelivery: parseInt(process.env.THROTTELING_WS_DELIVERY || '3', 10),
        maxParallelSend: parseInt(process.env.THROTTELING_WS_SEND || '1', 10),
    },

    Caching: {
        disabled: process.env.DISABLE_CACHE === 'true',
        useRedis: process.env.USE_REDIS !== 'false',
        version: process.env.CACHE_VERSION,
    },

    Query: {
        tll: parseInt(process.env.TTL_QUERIES || (60 * 24).toString(), 10),
    },

    Location: {
        useRedis: process.env.USE_REDIS_LOCATION === 'true',
    },

    stageName: process.env.STAGE,

    Redis: {
        host: process.env.REDIS_DEBUG_HOST || process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),

        cacheTimeout: process.env.REDIS_CACHE_TIMEOUT ? parseInt(process.env.REDIS_CACHE_TIMEOUT, 10) : undefined,
        retries: process.env.REDIS_MAX_REQUESTRETRIES ? parseInt(process.env.REDIS_MAX_REQUESTRETRIES, 10) : 5,

        maxTTL: process.env.REDIS_MAXTTL,
    },

    DB: {
        sqlLogLevel: process.env.SQL_LOG_LEVEL || 'error',
    },

    DynamoDB: {
        table: process.env.CACHE_TABLE,
        defautTTL: parseInt(process.env.TTL_DEFAULT || (60 * 60 * 24 * 2).toString(), 10),
    },

    S3: {
        bucket: process.env.UPLOAD_BUCKET as string,
        maxSize: 3 * 1000 * 1000,
    },
};
