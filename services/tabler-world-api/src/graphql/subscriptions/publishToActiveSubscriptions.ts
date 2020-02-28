import { ConsoleLogger, Audit, Metric } from '@mskg/tabler-world-common';
import { ExecutionResult, parse, subscribe } from 'graphql';
import { getAsyncIterator, isAsyncIterable } from 'iterall';
import { keys, remove } from 'lodash';
import { cacheInstance } from '../cache/cacheInstance';
import { dataSources } from '../dataSources';
import { executableSchema } from '../executableSchema';
import { ISubscriptionContext } from '../types/ISubscriptionContext';
import { subscriptionManager } from './services';
import { pubsub } from './services/pubsub';
import { ISubscription } from './types/ISubscription';
import { WebsocketEvent } from './types/WebsocketEvent';
import { createLimiter } from '../ratelimit/createLimiter';

export const logger = new ConsoleLogger('ws:publish:active');

export async function publishToActiveSubscriptions(subscriptions: ISubscription[], event: WebsocketEvent<any>, delivered = false): Promise<number[]> {
    const failedDeliveries: number[] = [];

    const promises = subscriptions.map(async ({ connection: { connectionId, principal, context: connectionContext }, subscriptionId, payload }) => {
        try {
            logger.log(`[${connectionId}] [${subscriptionId}]`, 'working');

            if (!payload || !payload.query) {
                logger.error(`[${connectionId}] [${subscriptionId}]`, 'Invalid payload', payload);
                return;
            }

            const document = parse(payload.query);
            const context = {
                connectionId,
                principal,
                clientInfo: {
                    version: connectionContext.version,
                    os: connectionContext.os,
                },
                dataSources: dataSources(),
                logger: new ConsoleLogger('publish', connectionId, principal.id),
                cache: cacheInstance,
                requestCache: {},
                getLimiter: createLimiter,
                auditor: new Audit(event.id, `${principal.email}:${principal.id}`),
                metrics: new Metric(),
            } as ISubscriptionContext;

            keys(context.dataSources).forEach((k) => {
                // @ts-ignore
                const ds: DataSource<IApolloContext> = context.dataSources[k];
                if (ds.initialize) {
                    ds.initialize({
                        context,
                        cache: cacheInstance,
                    });
                }
            });

            const iterable = await subscribe({
                document,
                schema: executableSchema,
                operationName: payload.operationName,
                variableValues: payload.variables,
                contextValue: context,
            });

            if (!isAsyncIterable(iterable)) {
                logger.error(`[${connectionId}] [${subscriptionId}]`, 'result not asyncIterable', iterable);
                failedDeliveries.push(principal.id);
                return;
            }

            // we need to have the iterator wait first
            const iterator = getAsyncIterator(iterable);
            const nextValue = iterator.next();

            // we use pubsub in memory to distribute the messages
            // publiush message
            pubsub.publish(event.eventName, {
                ...event,
                delivered, // this can be wrong
            } as WebsocketEvent<any>);

            // run resolver
            const result: IteratorResult<ExecutionResult> = await nextValue;

            context.auditor.dump();
            context.metrics.dump();

            if (result.value != null) {
                try {
                    // will log data anyway
                    await subscriptionManager.sendData(connectionId, subscriptionId, result.value);

                    // can be a stale connction for thre same user
                    remove(failedDeliveries, (p) => p === principal.id);
                } catch (err) {
                    logger.error(`[${connectionId}] [${subscriptionId}]`, 'failed to sendData', err);
                    failedDeliveries.push(principal.id);
                }
            } else {
                logger.log(`[${connectionId}] [${subscriptionId}]`, 'withFilter === false');
            }
        } catch (err) {
            failedDeliveries.push(principal.id);
            logger.error(`[${connectionId}] [${subscriptionId}]`, err);
        }
    });

    await Promise.all(promises);
    return failedDeliveries;
}
