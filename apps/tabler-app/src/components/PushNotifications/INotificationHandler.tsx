import { AppNotifications } from '../../model/NotificationPayload';

export enum NotificationHandlerResult {
    Handeled,
    ShowNotification,
}

export interface INotificationHandler<T extends AppNotifications> {
    canHandle(notification: AppNotifications): boolean;
    tryHandle(notification: T): NotificationHandlerResult;
    onClick(el: T, received: boolean);
}
