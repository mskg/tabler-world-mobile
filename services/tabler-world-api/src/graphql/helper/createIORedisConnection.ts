import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import IORedis, { Redis } from 'ioredis';
import { Environment } from '../Environment';

let instance: Redis;
const logger = new ConsoleLogger('ioredis');

export function createIORedisConnection() {
    if (!instance) {
        instance = new IORedis({
            showFriendlyErrorStack: EXECUTING_OFFLINE,
            maxRetriesPerRequest: Environment.Redis.retries,
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

        instance.on('error', (e) => {
            logger.warn('connection failed', e);
        });
    }

    return instance;
}
