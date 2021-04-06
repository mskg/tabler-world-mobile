import { Subscription } from '@unimodules/core';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Notification, NotificationResponse } from 'expo-notifications';
import React, { PureComponent } from 'react';
import Assets from '../../Assets';
import { Categories, Logger } from '../../helper/Logger';
import { AppNotifications } from '../../model/NotificationPayload';
import { AdvertismentHandler } from './AdvertismentHandler';
import { BirthdayHandler } from './BirthdayHandler';
import { ChatMessageHandler } from './ChatMessageHandler';
import { INotificationHandler, NotificationHandlerResult } from './INotificationHandler';
import { PushNotification, PushNotificationBase } from './PushNotification';
import { TestHandler } from './TestHandler';

const logger = new Logger(Categories.UIComponents.Notifications);

type Props = {
};

const TEST = false;

class PushNotificationsBase extends PureComponent<Props> {
    receivedSubscription!: Subscription;
    interactedSubscription!: Subscription;
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
        new TestHandler(),
    ];

    componentDidMount() {
        this.receivedSubscription = Notifications.addNotificationReceivedListener(this._handleNotification);
        this.interactedSubscription = Notifications.addNotificationResponseReceivedListener(this._handleInteraction);

        if (TEST && __DEV__) {
            const test = require('./testNotifications').testNotifications;

            setTimeout(
                () => test(this._handleNotification),
                2000,
            );
        }
    }

    componentWillUnmount() {
        if (this.receivedSubscription) { this.receivedSubscription.remove(); }
        if (this.interactedSubscription) { this.interactedSubscription.remove(); }
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

    _handleInteraction = (expoNotification: NotificationResponse) => {
        logger.debug('received', expoNotification);
        const data = expoNotification.notification.request.content.data as unknown as AppNotifications;

        const handler = this.notificationHandlers.find((h) => h.canHandle(data));
        if (!handler) {
            logger.log('Could not find handler', data);
            return;
        }

        handler.onClick(data, false);
    }

    _handleNotification = (expoNotification: Notification) => {
        try {
            logger.debug('received', expoNotification);
            const data = expoNotification.request.content.data as unknown as AppNotifications;

            const handler = this.notificationHandlers.find((h) => h.canHandle(data));
            if (!handler) {
                logger.log('Could not find handler', data);
                return;
            }

            logger.log('handler is', data?.reason);

            if (handler.tryHandle(data) !== NotificationHandlerResult.Handeled) {
                this.pendingNotifications.push({
                    handler,
                    notification: data,
                });

                if (!this.showing) { this._showNext(); }
            }
        } catch (e) {
            logger.error('handle-notification', e, { notification: expoNotification });
        }
    }

    render() {
        return (
            <PushNotification ref={(r) => this.pushComponent = r} />
        );
    }
}

export const PushNotifications = PushNotificationsBase;
