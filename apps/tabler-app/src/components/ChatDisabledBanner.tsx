import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Text as NativeText, View } from 'react-native';
import { Banner, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { logger } from '../analytics/logger';
import { I18N } from '../i18n/translation';
import { IAppState } from '../model/IAppState';
import { showNotificationSettings } from '../redux/actions/navigation';

type State = {
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    notifications: boolean,
};

type DispatchPros = {
    showNotificationSettings: typeof showNotificationSettings,
};

type Props = OwnProps & StateProps & DispatchPros;

// tslint:disable-next-line: export-name
export class ChatDisabledBannerBase extends React.Component<Props, State> {
    state: State = {
        notifications: true,
    };

    _tryopen = () => {
        Linking.canOpenURL('app-settings:')
            .then((supported) => {
                if (!supported) {
                    logger.log('Can\'t handle settings url');
                } else {
                    Linking.openURL('app-settings:');
                }
            })
            .catch((err) => {
                logger.error('linking-app-settings', err);
            });
    }

    render() {
        if (this.props.notifications) {
            return null;
        }

        return (
            <View style={{ paddingBottom: 16 }}>
                <Banner
                    visible={true}
                    actions={[
                        {
                            // @ts-ignore We provide a Text to color it
                            label: <NativeText style={{ color: this.props.theme.colors.accent }}>{I18N.Component_Notifications.chatDisabled.button.toUpperCase()}</NativeText>,
                            onPress: this._tryopen,
                        },
                    ]}
                    image={({ size }) =>
                        <Ionicons name="md-alert-circle" size={size} color={this.props.theme.colors.accent} />
                    }
                >
                    {I18N.Component_Notifications.chatDisabled.text}
                </Banner>
            </View>
        );
    }
}

export const ChatDisabledBanner = connect(
    (state: IAppState) => ({
        notifications: state.settings.supportsNotifications,
    }),
    {
        showNotificationSettings,
    })(
        withTheme(
            ChatDisabledBannerBase));
