import { Notifications } from 'expo';
import Constants from 'expo-constants';
import { EventSubscription } from 'fbemitter';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Assets from '../Assets';
import { Categories, Logger } from '../helper/Logger';
import { BirthdayNotification, INotificationPayload } from '../model/NotificationPayload';
import { showProfile } from '../redux/actions/navigation';
import { PushNotification, PushNotificationBase } from './PushNotification';

const logger = new Logger(Categories.UIComponents.Notifications);

type Props = {
    showProfile: typeof showProfile,
    // member: HashMap<IMember>,
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

    _handleAction = (el: INotificationPayload<any>) => () => {
        if (el != null && el.reason === 'birthday') {
            const bd = el as BirthdayNotification;

            // const tabler = this.props.member[bd.payload.id];
            // if (tabler != null) {
            this.props.showProfile(bd.payload.id);
            // }
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
    null,
    {
        showProfile,
    },
)(PushNotificationsBase);
