import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { DynamoDBStreamEvent } from 'aws-lambda';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { ExecutionResult, parse, subscribe } from 'graphql';
import { getAsyncIterator, isAsyncIterable } from 'iterall';
import { executableSchema } from './executableSchema';
import { connectionManager, eventManager, subscriptionManager } from './subscriptions';
import { pubsub } from './subscriptions/services/pubsub';
import { EncodedWebsocketEvent } from './subscriptions/services/WebsocketEventManager';
import { WebsocketLogger } from './subscriptions/utils/WebsocketLogger';
import { ISubscriptionContext } from './types/ISubscriptionContext';

const logger = new WebsocketLogger('Publish');

// tslint:disable-next-line: export-name
export async function handler(event: DynamoDBStreamEvent) {
    for (const subscruptionEvent of event.Records) {
        if (subscruptionEvent.eventName !== 'INSERT' || !subscruptionEvent.dynamodb || !subscruptionEvent.dynamodb.NewImage) {
            logger.error('Invalid event. Wrong dynamodb event type, can publish only `INSERT` events to subscribers.', subscruptionEvent);
            continue;
        }

        try {
            const encodedImage: EncodedWebsocketEvent = EXECUTING_OFFLINE
                ? subscruptionEvent.dynamodb.NewImage as EncodedWebsocketEvent
                : DynamoDB.Converter.unmarshall(subscruptionEvent.dynamodb.NewImage) as EncodedWebsocketEvent;

            const image = eventManager.unMarshall(encodedImage);
            logger.log(image);

            // const subscribers = await conversationManager.getSubscribers(image.trigger);
            // if (!subscribers || subscribers.length === 0) {
            //     logger.log('Channel', image.trigger, 'has no subscribers');
            //     // dont' work for nothing
            //     continue;
            // }

            const connections = await subscriptionManager.getSubscriptions(image.trigger);

            // all principals without a subscription, we need to send a push message to those
            // const missingPrincipals = filter(subscribers, (p) => connections.find((c) => c.connection.memberId === p) == null);

            const promises = connections.map(async ({ connection: { connectionId, payload, principal }, subscriptionId }) => {
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
                        logger: new WebsocketLogger('publish', connectionId, principal.id),
                    } as ISubscriptionContext,
                });

                if (!isAsyncIterable(iterable)) {
                    logger.error(`[${connectionId}] [${subscriptionId}]`, 'result not asyncIterable', iterable);
                    return;
                }

                logger.log('isAsyncIterable');

                const iterator = getAsyncIterator(iterable);
                const nextValue = iterator.next();

                // we use pubsub in memory to distribute the messages
                pubsub.publish(image.trigger, image);

                const result: IteratorResult<
                    ExecutionResult
                > = await nextValue;

                logger.log(`[${connectionId}] [${subscriptionId}]`, 'result', JSON.stringify(result.value));

                if (result.value != null) {
                    try {
                        await subscriptionManager.sendData(connectionId, subscriptionId, result.value);
                    } catch (err) {
                        logger.error(`[${connectionId}] [${subscriptionId}]`, err);
                        if (err.statusCode === 410) {	// this client has disconnected unsubscribe it
                            connectionManager.disconnect(connectionId);
                        }
                    }
                }
            });

            await Promise.all(promises);
        } catch (e) {
            logger.error(e);
        }
    }
}
