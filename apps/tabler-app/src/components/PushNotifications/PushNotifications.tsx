import { Notifications } from 'expo';
import Constants from 'expo-constants';
import { EventSubscription } from 'fbemitter';
import React, { PureComponent } from 'react';
import Assets from '../../Assets';
import { Categories, Logger } from '../../helper/Logger';
import { AppNotifications, IExpoNotification } from '../../model/NotificationPayload';
import { isSignedIn } from '../../tasks/helper/isSignedIn';
import { registerForPushNotifications } from '../../tasks/registerForPushNotifications';
import { AdvertismentHandler } from './AdvertismentHandler';
import { BirthdayHandler } from './BirthdayHandler';
import { ChatMessageHandler } from './ChatMessageHandler';
import { INotificationHandler, NotificationHandlerResult } from './INotificationHandler';
import { PushNotification, PushNotificationBase } from './PushNotification';

const logger = new Logger(Categories.UIComponents.Notifications);

type Props = {
};

const TEST = false;

class PushNotificationsBase extends PureComponent<Props> {
    subscription!: EventSubscription;
    pushComponent!: PushNotificationBase | null;

    pendingNotifications: {
        notification: AppNotifications,
        handler: INotificationHandler<AppNotifications>,
    }[] = [];

    showing = false;

    // could be static, but only one instance here
    // does not consume memory when not loaded
    notificationHandlers: INotificationHandler<AppNotifications>[] = [
        new ChatMessageHandler(logger),
        new BirthdayHandler(),
        new AdvertismentHandler(),
    ];

    componentDidMount() {
        this.subscription = Notifications.addListener(this._handleNotification);

        if (TEST && __DEV__) {
            const test = require('./testNotifications').testNotifications;

            setTimeout(
                () => test(this._handleNotification),
                2000,
            );
        }

        if (isSignedIn()) {
            // we need the saga to run
            registerForPushNotifications();
        }
    }

    componentWillUnmount() {
        this.subscription.remove();
    }

    _showNext = () => {
        const el = this.pendingNotifications.shift();
        logger.debug('_showNext', el);

        if (el == null) {
            this.showing = false;
            return;
        }

        this.showing = true;

        const { title, body } = el.notification;
        if (this.pushComponent) {
            this.pushComponent.showMessage({
                title,
                onDismiss: this._showNext,
                onPress: () => el.handler.onClick(el.notification, true),
                appName: Constants.manifest.name,
                icon: Assets.images.icon,
                body: body || JSON.stringify(el),
            });
        }
    }

    _handleNotification = (expoNotification: IExpoNotification) => {
        try {
            logger.debug('received', expoNotification);
            const { data: notification, origin } = expoNotification;

            // we cannot handle this
            if (!notification) {
                return;
            }

            const handler = this.notificationHandlers.find((h) => h.canHandle(notification));
            if (!handler) {
                logger.log('Could not find handler', notification);
                return;
            }

            logger.log('handler is', expoNotification.data?.reason);

            if (origin === 'received') {
                if (handler.tryHandle(notification) !== NotificationHandlerResult.Handeled) {
                    this.pendingNotifications.push({
                        handler,
                        notification,
                    });

                    if (!this.showing) { this._showNext(); }
                }

            } else {
                // user clicked the notification
                handler.onClick(notification, false);
            }
        } catch (e) {
            logger.error(e, 'Coud not handle', expoNotification);
        }
    }

    render() {
        return (
            <PushNotification ref={(r) => this.pushComponent = r} />
        );
    }
}

export const PushNotifications = PushNotificationsBase;
