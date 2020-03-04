import { Environment } from '../Environment';
import { createIORedisClient } from '../helper/createIORedisClient';
import { IRateLimiter } from './IRateLimiter';
import { NoLimit } from './NoLimit';
import { RollingLimit } from './RollingLimit';
import { Limiters } from '../types/IApolloContext';

const NO_LIMIT = new NoLimit();
const MINUTE = 60 * 1000;

const limiters: { [key: string]: IRateLimiter } = {};

export function createLimiter(name: Limiters): IRateLimiter {
    if (Environment.Throtteling.disabled || !Environment.Caching.useRedis) {
        return NO_LIMIT;
    }

    const cached = limiters[name];
    if (cached != null) { return cached; }

    if (name === 'requests') {
        limiters[name] = new RollingLimit({
            name,
            redis: createIORedisClient(),
            limit: Environment.Throtteling.requestRateLimit,
            intervalMS: MINUTE,
        });

        return limiters[name];
    }

    if (name === 'location') {
        limiters[name] = new RollingLimit({
            name,
            redis: createIORedisClient(),
            limit: Environment.Throtteling.geoRateLimit,
            intervalMS: MINUTE,
        });

        return limiters[name];
    }

    if (name === 'testpush') {
        limiters[name] = new RollingLimit({
            name,
            redis: createIORedisClient(),
            limit: Environment.Throtteling.testPushLimit,
            intervalMS: MINUTE,
        });

        return limiters[name];
    }

    return NO_LIMIT;
}
