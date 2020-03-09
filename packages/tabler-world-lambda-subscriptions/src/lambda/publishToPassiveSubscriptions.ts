import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { PushNotification, PushNotificationBase, PushNotificationService } from '@mskg/tabler-world-push-client';

const logger = new ConsoleLogger('ws:publish:passive');
const service = new PushNotificationService();

export async function publishToPassiveSubscriptions(members: number[], event: PushNotificationBase<any>, payload: any) {
    const messages: PushNotification<any>[] = members.map((m) => {
        return {
            ...event,
            member: m,
            // tslint:disable-next-line: object-shorthand-properties-first
            payload,
        };
    });

    if (EXECUTING_OFFLINE) {
        logger.log('Sending push messages', messages);
        return;
    }

    await service.send(messages);
}
