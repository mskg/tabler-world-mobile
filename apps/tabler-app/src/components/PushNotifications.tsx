import { Notifications } from 'expo';
import Constants from 'expo-constants';
import { EventSubscription } from 'fbemitter';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Assets from '../Assets';
import { Categories, Logger } from '../helper/Logger';
import { OpenLink } from '../helper/OpenLink';
import { Features, isFeatureEnabled } from '../model/Features';
import { IAppState } from '../model/IAppState';
import { AdMessageNotification, BirthdayNotification, ChatMessageNotification, INotificationWithPayload } from '../model/NotificationPayload';
import { showConversation, showProfile } from '../redux/actions/navigation';
import { PushNotification, PushNotificationBase } from './PushNotification';

const logger = new Logger(Categories.UIComponents.Notifications);

type Props = {
    showProfile: typeof showProfile,
    showConversation: typeof showConversation,
    activeConversation: string;
};

type Notification = {
    origin: 'selected' | 'received';
    data: any;
    remote: boolean;
    isMultiple: boolean;
};

class PushNotificationsBase extends PureComponent<Props> {
    _notificationSubscription!: EventSubscription;
    pushnotification!: PushNotificationBase | null;
    notifications: Notification[] = [];
    showing = false;

    componentDidMount() {
        this._notificationSubscription = Notifications.addListener(this._handleNotification);
    }

    componentWillUnmount() {
        this._notificationSubscription.remove();
    }

    _handleAction = (el: INotificationWithPayload<any>) => () => {
        if (el != null && el.reason === 'birthday') {
            const bd = el as BirthdayNotification;

            this.props.showProfile(bd.payload.id);
        } else if (el != null && el.reason === 'chatmessage') {
            if (isFeatureEnabled(Features.Chat)) {
                const cm = el as ChatMessageNotification;

                // if the same conversation is active, we can skip the notification
                if (this.props.activeConversation !== cm.payload.conversationId) {
                    this.props.showConversation(
                        cm.payload.conversationId,
                        cm.title,
                    );
                }
            }
        } else if (el != null && el.reason === 'advertisment') {
            const am = el as AdMessageNotification;

            if (am.payload.url) {
                OpenLink.url(am.payload.url);
            }
        }
    }

    _showNext = () => {
        const el = this.notifications.pop();

        if (el == null) {
            this.showing = false;
            return;
        }

        this.showing = true;

        const { title, body } = el.data;

        if (this.pushnotification) {
            this.pushnotification.showMessage({
                title,
                onDismiss: this._showNext,
                onPress: this._handleAction(el.data),
                appName: Constants.manifest.name,
                icon: Assets.images.icon,
                body: body || JSON.stringify(el.data),
            });
        }
    }

    _handleNotification = (notification: Notification) => {
        logger.log('received', notification);

        if (notification.origin === 'received') {
            this.notifications.push(notification);
            if (!this.showing) { this._showNext(); }
        } else {
            this._handleAction(notification.data)();
        }
    }

    render() {
        return (
            <PushNotification ref={(r) => this.pushnotification = r} />
        );
    }
}

export const PushNotifications = connect(
    (state: IAppState) => ({
        activeConversation: state.chat.activeConversation,
    }),
    {
        showProfile,
        showConversation,
    },
)(PushNotificationsBase);
