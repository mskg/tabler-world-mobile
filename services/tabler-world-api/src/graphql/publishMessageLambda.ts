import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { useDataService } from '@mskg/tabler-world-rds-client';
import { DynamoDBStreamEvent } from 'aws-lambda';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { filter } from 'lodash';
import { isChatEnabled } from './dataSources/ConversationsDataSource';
import { eventManager, pushSubscriptionManager, subscriptionManager } from './subscriptions';
import { encodeIdentifier } from './subscriptions/encodeIdentifier';
import { publishToActiveSubscriptions } from './subscriptions/publishToActiveSubscriptions';
import { publishToPassiveSubscriptions } from './subscriptions/publishToPassiveSubscriptions';
import { EncodedWebsocketEvent } from './subscriptions/types/EncodedWebsocketEvent';

const logger = new ConsoleLogger('publish');

// tslint:disable-next-line: export-name
export async function handler(event: DynamoDBStreamEvent) {
    for (const subscruptionEvent of event.Records) {
        if (subscruptionEvent.eventName !== 'INSERT' || !subscruptionEvent.dynamodb || !subscruptionEvent.dynamodb.NewImage) {
            logger.error('Ignoring event', subscruptionEvent.eventName);
            continue;
        }

        try {
            const encodedImage: EncodedWebsocketEvent = EXECUTING_OFFLINE
                ? subscruptionEvent.dynamodb.NewImage as EncodedWebsocketEvent
                : DynamoDB.Converter.unmarshall(subscruptionEvent.dynamodb.NewImage) as EncodedWebsocketEvent;

            const image = await eventManager.unMarshall<any>(encodedImage);
            logger.log(image);

            const subscriptions = await subscriptionManager.getSubscriptions(image.eventName) || [];

            let failedDeliveries: number[] = [];
            if (subscriptions.length > 0) {
                failedDeliveries = await publishToActiveSubscriptions(subscriptions, image);
            }

            const markDeliveredFunc = async () => {
                if (!image.trackDelivery) { return; }
                logger.log('Marking image as delivered', image.id);

                const remainingSubscriptions = subscriptions.filter(
                    (s) => failedDeliveries.find((f) => f === s.connection.memberId) == null);

                // @ts-ignore
                await Promise.all([
                    eventManager.markDelivered(image),
                    remainingSubscriptions.length > 0 ? publishToActiveSubscriptions(remainingSubscriptions, image, true) : undefined,
                ].filter(Boolean));
            };

            if (image.pushNotification) {
                const subscribers = await pushSubscriptionManager.getSubscribers(image.eventName) || [];

                // all principals without a subscription, we need to send a push message to those
                const missingPrincipals = filter(
                    subscribers,
                    (p) => true
                        && image.sender !== p // not sender
                        && (
                            subscriptions.find((c) => c.connection.memberId === p) == null // not already sent via socket
                            || failedDeliveries.find((c) => c === p) != null // delivery failed
                        ),
                );

                if (missingPrincipals.length > 0) {
                    const available = await useDataService({ logger }, (client) => isChatEnabled(client, missingPrincipals));

                    const resolved = missingPrincipals.filter((_p, i) => available[i]);
                    if (resolved.length > 0) {
                        await publishToPassiveSubscriptions(
                            missingPrincipals,
                            {
                                ...image.pushNotification,
                                options: {
                                    ...image.pushNotification.options || { sound: 'default' },
                                    badge: 1,
                                },
                            },
                            {
                                ...image.payload,

                                // this is really bad. Needs a better place to
                                // be independent of the transporting here
                                eventId: image.id,
                                conversationId: encodeIdentifier(image.eventName),
                            },
                        );
                    }

                    // delivered to all (but ok for 1:1 chat here)
                    if (missingPrincipals.length === resolved.length && image.trackDelivery) {
                        await markDeliveredFunc();
                    } else {
                        if (image.trackDelivery) {
                            logger.log('Message not delivered to all recipient.', missingPrincipals, available);
                        }
                    }
                } else {
                    await markDeliveredFunc();
                }
            } else {
                await markDeliveredFunc();
            }
        } catch (e) {
            logger.error(e);
        }
    }
}


