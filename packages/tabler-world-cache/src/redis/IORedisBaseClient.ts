import { ILogger } from '@mskg/tabler-world-common';
import { Redis } from 'ioredis';

export abstract class IORedisBaseClient {
    constructor(
        protected client: Redis,
        protected logger: ILogger = console,
    ) {
    }
}
