import { ConsoleLogger } from '@mskg/tabler-world-common';
import { DataSource } from 'apollo-datasource';
import { filter } from 'lodash';
import { SubscriptionServerContext } from '../server/SubscriptionServerContext';
import { AnyWebsocketEvent } from '../types/WebsocketEvent';
import { publishToActiveSubscriptions } from './publishToActiveSubscriptions';
import { publishToPassiveSubscriptions } from './publishToPassiveSubscriptions';

const logger = new ConsoleLogger('ws:publish');

export async function publishEvent<TConnection, TResolver extends { dataSources: DataSource<any>[] } = any>(
    context: SubscriptionServerContext<TConnection, TResolver>,
    image: AnyWebsocketEvent,
) {
    try {
        logger.debug(image);

        const { subscriptionManager, eventStorage, pushSubscriptionManager } = context;

        const subscriptions = await subscriptionManager.getSubscriptions(image.eventName) || [];

        let failedDeliveries: number[] = [];
        if (subscriptions.length > 0) {
            failedDeliveries = await publishToActiveSubscriptions(context, subscriptions, image);
        }

        const markDeliveredFunc = async () => {
            if (!image.trackDelivery) { return; }
            logger.log('Marking image as delivered', image.id);

            const remainingSubscriptions = subscriptions.filter(
                (s) => failedDeliveries.find((f) => f === s.connection.principal.id) == null);

            // @ts-ignore
            await Promise.all([
                eventStorage.markDelivered(image.eventName, image.id),
                remainingSubscriptions.length > 0
                    ? publishToActiveSubscriptions(context, remainingSubscriptions, image, true)
                    : undefined,
            ].filter(Boolean));
        };

        if (image.pushNotification && pushSubscriptionManager) {
            const subscribers = await pushSubscriptionManager.getSubscribers(image.eventName) || [];

            // all principals without a subscription, we need to send a push message to those
            const missingPrincipals = filter(
                subscribers,
                (p) => true
                    && image.sender !== p.id // not sender
                    && (
                        subscriptions.find((c) => c.connection.principal.id === p.id) == null // not already sent via socket
                        || failedDeliveries.find((c) => c === p.id) != null // delivery failed
                    ),
            );

            if (missingPrincipals.length > 0) {
                // tslint:disable-next-line: variable-name
                const resolved = missingPrincipals.filter((p) => !p.muted);
                if (resolved.length > 0) {
                    await publishToPassiveSubscriptions(
                        pushSubscriptionManager,
                        missingPrincipals.map((p) => p.id),
                        image,
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
