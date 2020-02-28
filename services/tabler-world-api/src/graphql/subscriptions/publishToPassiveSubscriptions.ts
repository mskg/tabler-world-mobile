import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { PushNotification, PushNotificationBase, PushNotificationService } from '@mskg/tabler-world-push-client';

export const logger = new ConsoleLogger('ws:publish:passive');

export async function publishToPassiveSubscriptions(members: number[], event: PushNotificationBase<any>, payload: any) {
    const messages: PushNotification<any>[] = members.map((m) => {
        return {
            ...event,
            member: m,
            payload,
        };
    });

    if (EXECUTING_OFFLINE) {
        logger.log('Sending push messages', messages);
        return;
    }

    const service = new PushNotificationService();
    await service.send(messages);
}
