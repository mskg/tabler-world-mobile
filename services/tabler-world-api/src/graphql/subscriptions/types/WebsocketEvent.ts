import { PushNotificationBase } from '@mskg/tabler-world-push-client';

export type WebsocketEventBase = {
    eventName: string;
    id: string;
    sender?: number,
    delivered?: boolean,
};

export type WebsocketEvent<T> = {
    pushNotification?: PushNotificationBase<T>,
    payload: T;
    trackDelivery: boolean,
} & WebsocketEventBase;
