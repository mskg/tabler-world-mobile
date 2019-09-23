import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { DynamoDBStreamEvent } from 'aws-lambda';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { ExecutionResult, parse, subscribe } from 'graphql';
import { getAsyncIterator, isAsyncIterable } from 'iterall';
import { flatMap } from 'lodash';
import { schema } from './schema/schema';
import { channelManager, connectionManager, subscriptionManager } from './services';
import { EncodedChannelMessage } from './services/ChannelManager';
import { ISubscriptionContext } from './types/ISubscriptionContext';
import { pubsub } from './utils/pubsub';
import { WebSocketLogger } from './utils/WebSocketLogger';

const logger = new WebSocketLogger('Publish');

// tslint:disable-next-line: export-name
export async function handler(event: DynamoDBStreamEvent) {
    for (const subscruptionEvent of event.Records) {
        if (subscruptionEvent.eventName !== 'INSERT' || !subscruptionEvent.dynamodb || !subscruptionEvent.dynamodb.NewImage) {
            logger.error('Invalid event. Wrong dynamodb event type, can publish only `INSERT` events to subscribers.', subscruptionEvent);
            continue;
        }

        try {
            const encodedImage: EncodedChannelMessage = EXECUTING_OFFLINE
                ? subscruptionEvent.dynamodb.NewImage as EncodedChannelMessage
                : DynamoDB.Converter.unmarshall(subscruptionEvent.dynamodb.NewImage) as EncodedChannelMessage;

            const image = channelManager.unMarshall(encodedImage);

            const subscribers = await channelManager.getSubscribers(image.channel);
            if (!subscribers || subscribers.length === 0) {
                logger.log('Channel', image.channel, 'has no subscribers');
                // dont' work for nothing
                continue;
            }

            // flat list of all connections for all subscribers
            const connections = flatMap(
                await Promise.all(
                    subscribers.map((s) => subscriptionManager.getAllForPrincipal(s))));


            // all principals without a subscription, we need to send a push message to those
            // const missingPrincipals = filter(subscribers, (p) => connections.find((c) => c.connection.memberId === p) == null);

            const promises = connections.map(async ({ connection: { connectionId, payload, principal }, subscriptionId }) => {
                if (!payload || !payload.query) {
                    logger.error(`[${connectionId}] [${subscriptionId}]`, 'Invalid payload', payload);
                    return;
                }

                const document = parse(payload.query);

                const iterable = await subscribe({
                    schema,
                    document,
                    operationName: payload.operationName,
                    variableValues: payload.variables,
                    contextValue: {
                        connectionId,
                        principal,
                        logger: new WebSocketLogger('publish', connectionId, principal.id),
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
                pubsub.publish('NEW_MESSAGE', image);

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
