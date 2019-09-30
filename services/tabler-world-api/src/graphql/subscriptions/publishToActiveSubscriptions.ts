import { ConsoleLogger } from '@mskg/tabler-world-common';
import { ExecutionResult, parse, subscribe } from 'graphql';
import { getAsyncIterator, isAsyncIterable } from 'iterall';
import { cacheInstance } from '../cache/cacheInstance';
import { dataSources } from '../dataSources';
import { executableSchema } from '../executableSchema';
import { ISubscriptionContext } from '../types/ISubscriptionContext';
import { connectionManager, subscriptionManager } from './services';
import { pubsub } from './services/pubsub';
import { ISubscription } from './types/ISubscription';
import { WebsocketEvent } from './types/WebsocketEvent';

export const logger = new ConsoleLogger('publish/ws');

export async function publishToActiveSubscriptions(subscriptions: ISubscription[], event: WebsocketEvent<any>): Promise<number[]> {
    const failedDeliveries: number[] = [];

    const promises = subscriptions.map(async ({ connection: { connectionId, payload, principal }, subscriptionId }) => {
        try {
            logger.log(`[${connectionId}] [${subscriptionId}]`, 'working');

            if (!payload || !payload.query) {
                logger.error(`[${connectionId}] [${subscriptionId}]`, 'Invalid payload', payload);
                return;
            }

            const document = parse(payload.query);
            const iterable = await subscribe({
                document,
                schema: executableSchema,
                operationName: payload.operationName,
                variableValues: payload.variables,
                contextValue: {
                    connectionId,
                    principal,
                    dataSources: dataSources(),
                    logger: new ConsoleLogger('publish', connectionId, principal.id),
                    cache: cacheInstance,
                    requestCache: {},
                } as ISubscriptionContext,
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
                    if (err.statusCode === 410) { // this client has disconnected unsubscribe it
                        connectionManager.disconnect(connectionId);
                    }

                    failedDeliveries.push(principal.id);
                }
            }
        } catch (err) {
            logger.error(`[${connectionId}] [${subscriptionId}]`, err);
        }
    });

    await Promise.all(promises);
    return failedDeliveries;
}
