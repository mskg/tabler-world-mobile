import { AdMessageNotification, AppNotifications } from '../../model/NotificationPayload';
import { INotificationHandler, NotificationHandlerResult } from './INotificationHandler';

export class TestHandler implements INotificationHandler<AdMessageNotification> {
    canHandle(notification: AppNotifications) {
        return notification && notification.reason === 'test';
    }

    tryHandle(_notification: AdMessageNotification): NotificationHandlerResult {
        return NotificationHandlerResult.ShowNotification;
    }

    onClick() {
    }
}
