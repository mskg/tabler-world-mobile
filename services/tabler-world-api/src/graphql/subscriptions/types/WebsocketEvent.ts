import { PushNotificationBase } from '@mskg/tabler-world-push-client';

export type WebsocketEvent<T> = {
    trigger: string;
    id: string;
    sender?: number,
    pushNotification?: PushNotificationBase<T>,
    payload: T;
};
