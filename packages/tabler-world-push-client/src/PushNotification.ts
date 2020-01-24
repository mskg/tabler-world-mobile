export type PushNotificationPayload = {
    title: string;
    subtitle?: string;
    body?: string;

    reason: string;
};

export type PushNotificationOptions = {
    sound: 'default' | null | {
        critical?: boolean;
        name?: 'default' | null;
        volume?: number;
    };

    ttl?: number;
    expiration?: number;
    priority?: 'default' | 'normal' | 'high';
    badge?: number;
};

export type PushNotificationBase<T = null> = {
    title: string;
    subtitle?: string;
    body?: string;

    options?: PushNotificationOptions;
    reason: string;

    payload?: T;
};

export type PushNotification<T = null> = {
    member: number,
} & PushNotificationBase<T>;
