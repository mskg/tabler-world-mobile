import { IORedisClient } from '@mskg/tabler-world-cache';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { filter, keys, map, values } from 'lodash';
import { ISubscription } from '../../core/types/ISubscription.js';
import { ISubscriptionStorage, SubscriptionDetails } from '../../core/types/ISubscriptionStorage.js';
import luaScript from './subscriptions.json';

const logger = new ConsoleLogger('redis');

const makeTriggerKey = (trigger: string) => `ws:trigger:${trigger}`;
const makeConnectionKey = (connectionId: string) => `ws:subscription:${connectionId}`;
const makeSubscriptionKey = (connectionId: string, subscriptionId: string) => `${connectionId}:${subscriptionId}`;

export class RedisSubscriptionStorage implements ISubscriptionStorage {
    constructor(private client: IORedisClient) {
    }

    public async hasSubscribers(triggers: string[]) {
        return filter(
            map(
                await Promise.all(
                    triggers.map((trigger) =>
                        this.client.hlen(
                            makeTriggerKey(trigger),
                        ),
                    ),
                ),
                (e, i) => e > 0 ? triggers[i] : undefined,
            ),
            Boolean,
        ) as string[];
    }

    public async list(trigger: string): Promise<ISubscription<any>[]> {
        logger.debug('list', trigger);

        const args = [
            makeTriggerKey(trigger), // keys will be correctly substituted
            makeConnectionKey(''), // with prefix
            trigger,
        ];

        let val: string;
        try {
            val = await this.client.evalsha(luaScript.sha1, 2, ...args);
        } catch (err) {
            if (err instanceof Error && err.message.includes('NOSCRIPT')) {
                // Script is missing, invoke again while providing the entire script
                val = await this.client.eval(luaScript.script, 2, ...args);
            }

            // Other error
            throw err;
        }

        return values(JSON.parse(val))
            .map((v) => JSON.parse(v));
    }

    public async put(triggers: string[], detail: SubscriptionDetails, ttl: number) {
        logger.debug(`[${detail.connection.connectionId}]`, `[${detail.subscriptionId}]`, 'put', triggers);

        const multi = await this.client.multi();

        // forward
        multi.hmset(
            makeConnectionKey(detail.connection.connectionId),
            triggers.map((trigger) => ({
                field: trigger,
                value: {
                    connectionId: detail.connection.connectionId,
                    subscriptionId: detail.subscriptionId,
                },
            })),
            ttl,
        );

        // reverse
        for (const trigger of triggers) {
            multi.hmset(
                makeTriggerKey(trigger),
                [{
                    field: makeSubscriptionKey(detail.connection.connectionId, detail.subscriptionId),
                    value: detail,
                }],
                ttl * 2, // ttl will be renewed with every new connection
            );
        }

        await multi.exec();
    }

    public async remove(connectionId: string, subscriptionId?: string) {
        logger.debug(`[${connectionId}]`, `[${subscriptionId}]`, 'remove');

        const result = await this.client.hgetall(makeConnectionKey(connectionId));
        const multi = await this.client.multi();

        const triggers = [];
        for (const key of keys(result)) {
            const val = result[key];

            if (subscriptionId === null || val.subscriptionId === subscriptionId) {
                triggers.push(key);
                multi.hdel(
                    makeTriggerKey(key), [makeSubscriptionKey(connectionId, val.subscriptionId)],
                );
            }
        }

        if (!subscriptionId) {
            // ok for hashes, deletes allkeys
            multi.del(
                makeConnectionKey(connectionId),
            );
        } else if (triggers.length > 0) {
            multi.hdel(
                makeConnectionKey(connectionId), triggers,
            );
        }

        await multi.exec();
    }
}
