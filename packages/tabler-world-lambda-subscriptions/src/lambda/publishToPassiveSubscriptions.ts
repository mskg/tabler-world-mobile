import { ConsoleLogger } from '@mskg/tabler-world-common';
import { IPushSubscriptionManager } from '../types';
import { AnyWebsocketEvent } from '../types/WebsocketEvent';

const logger = new ConsoleLogger('ws:publish:passive');
// const service = new PushNotificationService();

export async function publishToPassiveSubscriptions(
    service: IPushSubscriptionManager,
    members: number[],
    event: AnyWebsocketEvent,
) {
    // const messages: PushNotification[] = members.map((m) => {
    //     return {
    //         ...event,
    //         payload,
    //         member: m,
    //     };
    // });

    // image.pushNotification,
    // {
    //     ...image.payload,
    //     eventId: image.id,
    // },

    logger.log('Sending push messages to', event.id, members);
    await service.send(event, members);
}
