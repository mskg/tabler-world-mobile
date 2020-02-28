import { ConsoleLogger } from '@mskg/tabler-world-common';
import { useDatabase } from '@mskg/tabler-world-rds-client';
import { filter } from 'lodash';
import { eventManager, pushSubscriptionManager, subscriptionManager } from '.';
import { isChatEnabled } from '../dataSources/ConversationsDataSource';
import { encodeIdentifier } from './encodeIdentifier';
import { publishToActiveSubscriptions } from './publishToActiveSubscriptions';
import { publishToPassiveSubscriptions } from './publishToPassiveSubscriptions';
import { WebsocketEvent } from './types/WebsocketEvent';

const logger = new ConsoleLogger('ws:publish');

export async function publishEvent(image: WebsocketEvent<any>) {
    try {
        logger.debug(image);

        const subscriptions = await subscriptionManager.getSubscriptions(image.eventName) || [];
        let cleanUp: Promise<void> | undefined;

        let failedDeliveries: number[] = [];
        if (subscriptions.length > 0) {
            failedDeliveries = await publishToActiveSubscriptions(subscriptions, image);

            if (failedDeliveries.length > 0) {
                cleanUp = subscriptionManager.cleanup(image.eventName);
            }
        }

        const markDeliveredFunc = async () => {
            if (!image.trackDelivery) { return; }
            logger.log('Marking image as delivered', image.id);

            const remainingSubscriptions = subscriptions.filter(
                (s) => failedDeliveries.find((f) => f === s.connection.memberId) == null);

            // @ts-ignore
            await Promise.all([
                eventManager.markDelivered(image),
                remainingSubscriptions.length > 0
                    ? publishToActiveSubscriptions(remainingSubscriptions, image, true)
                    : undefined,
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
                const available = await useDatabase({ logger }, (client) => isChatEnabled(client, missingPrincipals));

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

        if (cleanUp) {
            await cleanUp;
        }
    } catch (e) {
        logger.error(e);
    }
}
