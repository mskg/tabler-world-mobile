import { Notifications } from 'expo';
import Constants from 'expo-constants';
import { EventSubscription } from 'fbemitter';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Assets from '../Assets';
import { Categories, Logger } from '../helper/Logger';
import { IAppState } from '../model/IAppState';
import { BirthdayNotification, INotificationPayload } from '../model/NotificationPayload';
import { showProfile } from '../redux/actions/navigation';
import { PushNotification, PushNotificationBase } from './PushNotification';

const logger = new Logger(Categories.UIComponents.Notifications);

type Props = {
    showProfile: typeof showProfile,
    // member: HashMap<IMember>,
};

class PushNotificationsBase extends PureComponent<Props> {
    _notificationSubscription!: EventSubscription;
    pushnotification!: PushNotificationBase;
    notifications: Notifications.Notification[] = [];
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
        let el = this.notifications.pop();

        if (el == null) {
            this.showing = false;
            return;
        }

        this.showing = true;

        const { title, body } = el.data;
        this.pushnotification.showMessage({
            onDismiss: this._showNext,
            onPress: this._handleAction(el.data),
            appName: Constants.manifest.name,
            icon: Assets.images.icon,
            title,
            body: body || JSON.stringify(el.data),
        });
    }

    _handleNotification = (notification: Notifications.Notification) => {
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
        // member: state.members.data
    }),
    {
        showProfile,
    },
)(PushNotificationsBase);
