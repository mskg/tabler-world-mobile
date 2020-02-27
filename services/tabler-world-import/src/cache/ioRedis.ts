import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import IORedis from 'ioredis';
import { Environment } from '../Environment';

export const ioRedis = new IORedis({
    keyPrefix: `${Environment.stageName}:`,
    lazyConnect: true,

    connectionName: `api:${Environment.stageName}`,
    host: Environment.Redis.host,
    port: Environment.Redis.port,

    tls: EXECUTING_OFFLINE
        ? undefined
        : {
            checkServerIdentity: () => {
                // skip certificate hostname validation
                return undefined;
            },
        },
});
