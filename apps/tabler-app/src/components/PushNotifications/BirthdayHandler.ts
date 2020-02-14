import { AppNotifications, BirthdayNotification } from '../../model/NotificationPayload';
import { showProfile } from '../../redux/actions/navigation';
import { getReduxStore } from '../../redux/getRedux';
import { INotificationHandler, NotificationHandlerResult } from './INotificationHandler';

export class BirthdayHandler implements INotificationHandler<BirthdayNotification> {
    canHandle(notification: AppNotifications) {
        return notification && notification.reason === 'birthday';
    }

    tryHandle(_notification: BirthdayNotification): NotificationHandlerResult {
        return NotificationHandlerResult.ShowNotification;
    }

    onClick(el: BirthdayNotification) {
        getReduxStore().dispatch(showProfile(el.payload.id));
    }
}
