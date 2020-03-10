import { ConsoleLogger } from '@mskg/tabler-world-common';
import { IPushSubscriptionManager, PushSubscriber } from '../types';
import { AnyWebsocketEvent } from '../types/WebsocketEvent';

const logger = new ConsoleLogger('ws:publish:passive');
// const service = new PushNotificationService();

export async function publishToPassiveSubscriptions(
    service: IPushSubscriptionManager,
    members: PushSubscriber[],
    event: AnyWebsocketEvent,
) {
    logger.log('Sending push messages to', event.id, members);
    await service.send(event, members);
}
