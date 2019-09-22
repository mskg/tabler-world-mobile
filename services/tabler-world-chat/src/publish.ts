import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { DynamoDBStreamEvent } from 'aws-lambda';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { ExecutionResult, parse, subscribe } from 'graphql';
import { getAsyncIterator, isAsyncIterable } from 'iterall';
import { flatMap } from 'lodash';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import { ChannelManager, ChannelMessage } from './models/ChannelManager';
import { ConnectionManager } from './models/ConnectionManager';
import { SubscriptionManager } from './models/SubscriptionManager';
import { schema } from './schema/schema';
import { pubsub } from './utils/pubsub';

const connectionManager = new ConnectionManager();
const subscriptionManager = new SubscriptionManager();
const channelManager = new ChannelManager();

// tslint:disable-next-line: export-name
export async function handler(event: DynamoDBStreamEvent) {
    for (const subscruptionEvent of event.Records) {
        if (subscruptionEvent.eventName !== 'INSERT' || !subscruptionEvent.dynamodb || !subscruptionEvent.dynamodb.NewImage) {
            console.error('Invalid event. Wrong dynamodb event type, can publish only `INSERT` events to subscribers.', subscruptionEvent);
            continue;
        }

        try {
            const image: ChannelMessage = EXECUTING_OFFLINE
                ? subscruptionEvent.dynamodb.NewImage as ChannelMessage
                : DynamoDB.Converter.unmarshall(subscruptionEvent.dynamodb.NewImage) as ChannelMessage;

            const subscribers = await channelManager.getSubscribers(image.channel);
            if (!subscribers || subscribers.length === 0) {
                // dont' work for nothing
                return;
            }

            // flat list of all connections for all subscribers
            const connections = flatMap(
                await Promise.all(
                    subscribers.map((s) => subscriptionManager.getAllForPrincipal(s))));

            const promises = connections.map(async ({ connection: { connectionId, payload }, subscriptionId }) => {
                if (!payload || !payload.query) {
                    console.error('Invalid payload', connectionId, subscriptionId, payload);
                    return;
                }

                const document = parse(payload.query);

                const iterable = await subscribe({
                    schema,
                    document,
                    operationName: payload.operationName,
                    variableValues: payload.variables,
                    contextValue: {
                    },
                });

                if (!isAsyncIterable(iterable)) {
                    console.error('!isAsyncIterable??', iterable);
                    // something went wrong, probably there is an error
                    return;
                }

                console.log('isAsyncIterable');

                const iterator = getAsyncIterator(iterable);
                const nextValue = iterator.next();

                // we use pubsub in memory to distribute the messages
                pubsub.publish('NEW_MESSAGE', image);

                const result: IteratorResult<
                    ExecutionResult
                > = await nextValue;

                console.log('result', JSON.stringify(result.value));

                if (result.value != null) {
                    try {
                        await connectionManager.sendMessage(connectionId, {
                            id: subscriptionId,
                            payload: result.value,
                            type: MessageTypes.GQL_DATA,
                        });
                    } catch (err) {
                        console.error(err);
                        if (err.statusCode === 410) {	// this client has disconnected unsubscribe it
                            connectionManager.disconnect(connectionId);
                        }
                    }
                }
            });

            await Promise.all(promises);
        } catch (e) {
            console.error(e);
        }
    }
}
