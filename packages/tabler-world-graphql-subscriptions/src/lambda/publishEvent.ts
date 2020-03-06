import { ConsoleLogger } from '@mskg/tabler-world-common';
import { DataSource } from 'apollo-datasource';
import { filter } from 'lodash';
import { SubscriptionServerContext } from '../server/SubscriptionServerContext';
import { WebsocketEvent } from '../core/types/WebsocketEvent';
import { publishToActiveSubscriptions } from './publishToActiveSubscriptions';
import { publishToPassiveSubscriptions } from './publishToPassiveSubscriptions';

const logger = new ConsoleLogger('ws:publish');

export async function publishEvent<TConnection, TResolver extends { dataSources: DataSource<any>[] } = any>(
    context: SubscriptionServerContext<TConnection, TResolver>,
    image: WebsocketEvent<any>,
) {
    try {
        logger.debug(image);

        const { subscriptionManager, eventManager, pushSubscriptionManager } = context;

        const subscriptions = await subscriptionManager.getSubscriptions(image.eventName) || [];

        let failedDeliveries: number[] = [];
        if (subscriptions.length > 0) {
            failedDeliveries = await publishToActiveSubscriptions(context, subscriptions, image);
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
                    ? publishToActiveSubscriptions(context, remainingSubscriptions, image, true)
                    : undefined,
            ].filter(Boolean));
        };

        if (image.pushNotification) {
            const subscribers = await pushSubscriptionManager.getSubscribers(image.eventName) || [];

            // all principals without a subscription, we need to send a push message to those
            const missingPrincipals = filter(
                subscribers,
                (p) => true
                    && image.sender !== p.id // not sender
                    && (
                        subscriptions.find((c) => c.connection.memberId === p.id) == null // not already sent via socket
                        || failedDeliveries.find((c) => c === p.id) != null // delivery failed
                    ),
            );

            if (missingPrincipals.length > 0) {
                // tslint:disable-next-line: variable-name
                const resolved = missingPrincipals.filter((p) => !p.muted);
                if (resolved.length > 0) {
                    await publishToPassiveSubscriptions(
                        missingPrincipals.map((p) => p.id),
                        {
                            ...image.pushNotification,
                            options: {
                                ...image.pushNotification.options || { sound: 'default' },
                                badge: 1,
                            },
                        },
                        {
                            ...image.payload,
                            eventId: image.id,
                        },
                    );
                }

                // delivered to all (but ok for 1:1 chat here)
                if (missingPrincipals.length === resolved.length && image.trackDelivery) {
                    await markDeliveredFunc();
                } else {
                    if (image.trackDelivery) {
                        logger.log('Message not delivered to all recipient.', subscribers.filter((s) => s.muted));
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
