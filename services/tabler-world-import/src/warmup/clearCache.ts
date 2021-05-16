import { IORedisClient } from '@mskg/tabler-world-cache';
import { Environment } from '../Environment';

export function clearCache(redis: IORedisClient, prefix = `${Environment.stageName}:${Environment.Caching.version}:*`) {
    // we don't care about LUA evaluation
    return redis.eval(
        `local keys = redis.call('keys', ARGV[1])
for i=1,#keys,5000 do
    redis.call('del', unpack(keys, i, math.min(i+4999, #keys)))
end

return keys`,
        0,
        prefix, // this is not a key and such not prefixed
    );
}
