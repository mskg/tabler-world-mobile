import { Environment } from '../Environment';
import { createIORedisClient } from '../helper/createIORedisClient';
import { IRateLimiter } from './IRateLimiter';
import { NoLimit } from './NoLimit';
import { RollingLimit } from './RollingLimit';

type Limiters = 'location' | 'requests';
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
            redis: createIORedisClient(),
            limit: Environment.Throtteling.requestRateLimit,
            name: 'global',
            intervalMS: MINUTE,
        });

        return limiters[name];
    }

    if (name === 'location') {
        limiters[name] = new RollingLimit({
            redis: createIORedisClient(),
            limit: Environment.Throtteling.geoRateLimit,
            name: 'location',
            intervalMS: MINUTE,
        });

        return limiters[name];
    }

    return NO_LIMIT;
}
