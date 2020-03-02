-- docker run -ti --network host --rm redis redis-cli -h host.docker.internal EVAL "$(cat subscriptions.lua)" 2 "dev:ws:trigger:ALL(:14225:)" "ALL(:14225:)" "dev:ws:subscription:"
-- docker run -ti --network host --rm redis redis-cli -h host.docker.internal SCRIPT LOAD "$(cat subscriptions.lua)"

local triggerKey  = KEYS[1] -- dev:ws:trigger:ALL(:14225:)
local prefix      = KEYS[2] -- dev:ws:subscription:
local triggerHash = ARGV[1] -- ALL(:14225:)

-- this lists all subscriptions for the given trigger
local subscriptions = redis.call("HGETALL", triggerKey)
local result = {}

local temp
local connection
local subscription

for idx = 1, #subscriptions, 2 do
    subscription = subscriptions[idx]
    connection = string.gsub(subscription, "\:.*", "")
    temp = redis.call("HMGET", prefix .. connection, triggerHash)

    -- connection does no longer exist for connection
    if (temp[1] == false) then
        redis.call("HDEL", triggerKey, subscription)
    else
        result[subscription] = subscriptions[idx + 1]
    end
end

return cjson.encode(result)
