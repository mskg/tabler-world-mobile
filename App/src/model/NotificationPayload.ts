type Reasons = "birthday";

export interface INotificationPayload<T = void> {
    title?: string,
    body: string,
    reason: Reasons,
    payload: T,
}

export type BirthdayNotification = INotificationPayload<{
    date: Date,
    id: number,
}>;
