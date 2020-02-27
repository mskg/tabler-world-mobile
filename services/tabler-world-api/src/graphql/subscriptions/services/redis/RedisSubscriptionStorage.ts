import { ConsoleLogger } from '@mskg/tabler-world-common';
import { filter, keys, map, remove, uniq, values } from 'lodash';
import { RedisStorage } from '../../../helper/RedisStorage';
import { ISubscription } from '../../types/ISubscription';
import { ISubscriptionStorage, SubscriptionDetails } from '../ISubscriptionStorage';

const logger = new ConsoleLogger('redis');

const makeTriggerKey = (trigger: string) => `ws:trigger:${trigger}`;
const makeConnectionKey = (connectionId: string) => `ws:subscription:${connectionId}`;
const makeSubscriptionKey = (connectionId: string, subscriptionId: string) => `${connectionId}:${subscriptionId}`;

export class RedisSubscriptionStorage implements ISubscriptionStorage {
    constructor(private client: RedisStorage) {
    }

    public async cleanup(trigger: string): Promise<void> {
        await this.list(trigger, true);
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

    public async list(trigger: string, cleanUp = false): Promise<ISubscription[]> {
        logger.log('list', trigger);

        // get all subscriptions for given trigger
        const query = await this.client.hgetall(
            makeTriggerKey(trigger),
        );

        const subscriptions: ISubscription[] = values(query);

        if (cleanUp) {
            const activeConnections: string[] = [];

            for (const connectionId of uniq(subscriptions.map((v) => v.connection.connectionId))) {
                // cannot query multiple keys at once
                const conRecord = await this.client.hmget(
                    makeConnectionKey(connectionId),
                    [trigger],
                );

                if (conRecord[trigger]) {
                    activeConnections.push(connectionId);
                } else {
                    logger.log('Connection', connectionId, 'is stale');
                }
            }

            // logger.log(
            //     'sub',
            //     subscriptions.map(s => s.connection.connectionId),
            //     'active',
            //     activeConnections,
            //     'active sub',
            //     filter(
            //         subscriptions,
            //         (sub) => activeConnections.find(
            //             (active) => active === sub.connection.connectionId,
            //         ) == null,
            //     ).map(s => s.connection.connectionId),
            // );

            // all that are no longer in; can take two roundtrips to remove them
            const missing = remove(
                subscriptions,
                (sub) => activeConnections.find(
                    (active) => active === sub.connection.connectionId,
                ) == null,
            );

            if (missing.length > 0) {
                logger.log('Removing stale subscriptions');

                // cleanup
                await this.client.hdel(
                    makeTriggerKey(trigger),
                    missing.map((m) => makeSubscriptionKey(m.connection.connectionId, m.subscriptionId)),
                );
            }
        }

        return subscriptions;
    }

    public async put(triggers: string[], detail: SubscriptionDetails, ttl: number) {
        logger.log(`[${detail.connection.connectionId}]`, `[${detail.subscriptionId}]`, 'put', triggers);

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
        logger.log(`[${connectionId}]`, `[${subscriptionId}]`, 'remove');

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
