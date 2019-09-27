import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { DynamoDBStreamEvent } from 'aws-lambda';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { filter } from 'lodash';
import { conversationManager, eventManager, subscriptionManager } from './subscriptions';
import { publishToActiveSubscriptions } from './subscriptions/publishToActiveSubscriptions';
import { publishToPassiveSubscriptions } from './subscriptions/publishToPassiveSubscriptions';
import { EncodedWebsocketEvent } from './subscriptions/types/EncodedWebsocketEvent';

const logger = new ConsoleLogger('publish');

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

            const subscriptions = await subscriptionManager.getSubscriptions(image.trigger) || [];

            // if (connections.length === 0 && subscribers.length === 0) {
            //     logger.log('Channel', image.trigger, 'has no subscribers');
            //     // dont' work for nothing
            //     continue;
            // }

            if (subscriptions.length > 0) {
                await publishToActiveSubscriptions(subscriptions, image);
            }

            if (image.pushNotification) {
                const subscribers = await conversationManager.getSubscribers(image.trigger) || [];

                // all principals without a subscription, we need to send a push message to those
                const missingPrincipals = filter(
                    subscribers,
                    (p) => true
                        && image.sender !== p // not sender
                        && subscriptions.find((c) => c.connection.memberId === p) == null, // not already sent via socket
                );

                if (missingPrincipals.length > 0) {
                    await publishToPassiveSubscriptions(missingPrincipals, image.pushNotification, image.payload);
                }
            }

        } catch (e) {
            logger.error(e);
        }
    }
}


