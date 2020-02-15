import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text as NativeText, View } from 'react-native';
import { Banner, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { I18N } from '../i18n/translation';
import { IAppState } from '../model/IAppState';
import { showNotificationSettings } from '../redux/actions/navigation';

type State = {
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    notificationsOneToOneChat: boolean,
};

type DispatchPros = {
    showNotificationSettings: typeof showNotificationSettings,
};

type Props = OwnProps & StateProps & DispatchPros;

// tslint:disable-next-line: export-name
export class ChatDisabledBannerBase extends React.Component<Props, State> {
    render() {
        if (this.props.notificationsOneToOneChat || this.props.notificationsOneToOneChat == null) {
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
                            onPress: () => this.props.showNotificationSettings(),
                        },
                    ]}
                    image={({ size }) =>
                        <Ionicons name="md-alert" size={size} color={this.props.theme.colors.accent} />
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
        notificationsOneToOneChat: state.settings.notificationsOneToOneChat == null ? true : state.settings.notificationsOneToOneChat,
    }),
    {
        showNotificationSettings,
    })(
        withTheme(
            ChatDisabledBannerBase));
