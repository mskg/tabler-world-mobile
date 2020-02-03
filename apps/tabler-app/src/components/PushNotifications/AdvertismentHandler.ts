import { OpenLink } from '../../helper/OpenLink';
import { AdMessageNotification, AppNotifications } from '../../model/NotificationPayload';
import { INotificationHandler, NotificationHandlerResult } from './INotificationHandler';

export class AdvertismentHandler implements INotificationHandler<AdMessageNotification> {
    canHandle(notification: AppNotifications) {
        return notification && notification.reason === 'advertisment';
    }

    tryHandle(_notification: AdMessageNotification): NotificationHandlerResult {
        return NotificationHandlerResult.ShowNotification;
    }

    onClick(el: AdMessageNotification) {
        if (el.payload.url) {
            OpenLink.url(el.payload.url);
        }
    }
}
