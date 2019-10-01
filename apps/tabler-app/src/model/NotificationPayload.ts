type Reasons = 'birthday' | 'chatmessage';

export interface INotificationWithPayload<T = void> {
    title?: string;
    body: string;
    reason: Reasons;
    payload: T;
}

export type BirthdayNotification = INotificationWithPayload<{
    date: Date,
    id: number,
}>;

enum MessageType {
    text = 'text',
}

export type ChatMessageNotification = INotificationWithPayload<{
    id: string,
    senderId: number,
    payload: any,
    receivedAt: number,
    type: MessageType,
    eventId: string,
    conversationId: string,
}>;
