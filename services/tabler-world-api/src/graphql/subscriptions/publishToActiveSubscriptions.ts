import { ConsoleLogger } from '@mskg/tabler-world-common';
import { ExecutionResult, parse, subscribe } from 'graphql';
import { getAsyncIterator, isAsyncIterable } from 'iterall';
import { keys } from 'lodash';
import { cacheInstance } from '../cache/cacheInstance';
import { dataSources } from '../dataSources';
import { executableSchema } from '../executableSchema';
import { ISubscriptionContext } from '../types/ISubscriptionContext';
import { subscriptionManager } from './services';
import { pubsub } from './services/pubsub';
import { ISubscription } from './types/ISubscription';
import { WebsocketEvent } from './types/WebsocketEvent';

export const logger = new ConsoleLogger('publish/ws');

export async function publishToActiveSubscriptions(subscriptions: ISubscription[], event: WebsocketEvent<any>): Promise<number[]> {
    const failedDeliveries: number[] = [];

    const promises = subscriptions.map(async ({ connection: { connectionId, payload, principal, context: connectionContext }, subscriptionId }) => {
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
                },
                dataSources: dataSources(),
                logger: new ConsoleLogger('publish', connectionId, principal.id),
                cache: cacheInstance,
                requestCache: {},
            } as ISubscriptionContext;

            keys(context.dataSources).forEach((k) => {
                // @ts-ignore
                context.dataSources[k].initialize({
                    context,
                    cache: cacheInstance,
                });
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
                return;
            }

            // we need to have the iterator wait first
            const iterator = getAsyncIterator(iterable);
            const nextValue = iterator.next();

            // we use pubsub in memory to distribute the messages
            // publiush message
            pubsub.publish(event.eventName, {
                ...event,
                delivered: true,
            } as WebsocketEvent<any>);

            // run resolver
            const result: IteratorResult<ExecutionResult> = await nextValue;
            logger.log(`[${connectionId}] [${subscriptionId}]`, 'result', JSON.stringify(result.value));

            if (result.value != null) {
                try {
                    await subscriptionManager.sendData(connectionId, subscriptionId, result.value);
                } catch (err) {
                    logger.error(`[${connectionId}] [${subscriptionId}]`, err);
                    failedDeliveries.push(principal.id);
                }
            } else {
                logger.log('value is null');
            }
        } catch (err) {
            logger.error(`[${connectionId}] [${subscriptionId}]`, err);
        }
    });

    await Promise.all(promises);
    return failedDeliveries;
}
