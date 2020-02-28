import { PushNotificationBase } from '@mskg/tabler-world-push-client';

export type WebsocketEventBase = {
    eventName: string;
    id: string;

    /**
     * Keep a seperate timestamp for better days
     */
    timestamp: number,

    sender?: number,

    /**
     * Read by all users
     */
    delivered?: boolean,

    /**
     * Wil be removed after delivery
     */
    volatile?: boolean,

    /**
     * Not encrypted
     */
    plain?: boolean,
};

export type WebsocketEvent<T> = {
    pushNotification?: PushNotificationBase<T>,
    payload: T;
    trackDelivery: boolean,
} & WebsocketEventBase;
