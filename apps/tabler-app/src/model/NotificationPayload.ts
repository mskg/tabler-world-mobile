// export interface IExpoNotification {
//     origin: 'selected' | 'received';
//     remote: boolean;
//     isMultiple: boolean;
//     data?: AppNotifications;
// }

type Reasons = 'birthday' | 'chatmessage' | 'advertisment' | 'test';

export interface INotificationPayload<T, R extends Reasons> {
    title?: string;
    body: string;
    reason: R;
    payload: T;
}

export type BirthdayNotification = INotificationPayload<{
    date: Date,
    id: number,
}, 'birthday'>;

enum ChatMessageType {
    text = 'text',
    image = 'image',
}

export type ChatMessageNotification = INotificationPayload<{
    id: string,
    senderId: number,
    payload: {
        text?: string,
        image?: string,
    },
    receivedAt: number,
    type: ChatMessageType,
    eventId: string,
    conversationId: string,
    delivered?: boolean,
    accepted?: boolean,
}, 'chatmessage'>;

export type AdMessageNotification = INotificationPayload<{
    url?: string,
}, 'advertisment'>;

export type TestMessageNotification = INotificationPayload<{
}, 'test'>;


export type AppNotifications = BirthdayNotification
    | ChatMessageNotification
    | AdMessageNotification
    | TestMessageNotification;
