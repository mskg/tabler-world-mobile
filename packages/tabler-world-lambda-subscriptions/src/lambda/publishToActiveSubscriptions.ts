import { AsyncPool, ConsoleLogger } from '@mskg/tabler-world-common';
import { DataSource } from 'apollo-datasource';
import { ExecutionResult, parse, subscribe } from 'graphql';
import { getAsyncIterator, isAsyncIterable } from 'iterall';
import { keys, remove } from 'lodash';
import { Environment } from '../server/Environment';
import { SubscriptionServerContext } from '../server/SubscriptionServerContext';
import { ISubscription } from '../types/ISubscription';
import { AnyWebsocketEvent } from '../types/WebsocketEvent';
import { pubsub } from '../utils/pubsub';

const logger = new ConsoleLogger('ws:publish:active');

// tslint:disable-next-line: max-func-body-length
export async function publishToActiveSubscriptions<TConnection = any, TResolver extends { dataSources: DataSource<any>[] } = any>(
    serverContext: SubscriptionServerContext<TConnection, TResolver>,
    subscriptions: ISubscription<TConnection>[],
    event: AnyWebsocketEvent,
    delivered = false,
): Promise<number[]> {
    const failedDeliveries: number[] = [];
    const { subscriptionManager } = serverContext;

    await AsyncPool<ISubscription<any>, void>(
        Environment.Throtteling.maxParallelDelivery,
        subscriptions,
        // tslint:disable-next-line: max-func-body-length
        async ({ connection: { connectionId, principal, context: connectionContext }, subscriptionId, payload }) => {
            try {
                logger.log(`[${connectionId}] [${subscriptionId}]`, 'working');

                if (!payload || !payload.query) {
                    logger.error(`[${connectionId}] [${subscriptionId}]`, 'Invalid payload', payload);
                    return;
                }

                const document = parse(payload.query);
                const context = serverContext.onCreateContext
                    ? await serverContext.onCreateContext({
                        connectionId,
                        principal,
                        eventId: event.id,
                        context: connectionContext,
                    })
                    : { dataSources: [] } as unknown as TResolver;

                keys(context.dataSources).forEach((k) => {
                    // @ts-ignore
                    const ds: DataSource<IApolloContext> = context.dataSources[k];
                    if (ds.initialize) {
                        ds.initialize({
                            context,
                            cache: serverContext.cache,
                        });
                    }
                });

                const iterable = await subscribe({
                    document,
                    schema: serverContext.schema,
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
                } as AnyWebsocketEvent);

                // run resolver
                const result: IteratorResult<ExecutionResult> = await nextValue;

                if (result.value != null) {
                    try {
                        // will log data anyway
                        await subscriptionManager.sendData(connectionId, subscriptionId, result.value);

                        if (serverContext.onEventSent) {
                            await serverContext.onEventSent({
                                context,
                                event,
                                principal,
                            });
                        }

                        if (serverContext.onSubscriptionCreated) {
                            await serverContext.onSubscriptionCreated(context);
                        }

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
        },
    );

    return failedDeliveries;
}
