import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Divider, List, Portal, Switch, Text, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { ActionNames } from '../../../analytics/ActionNames';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditPropertyNames } from '../../../analytics/AuditPropertyNames';
import { AuditScreenName } from '../../../analytics/AuditScreenName';
import { cachedAolloClient } from '../../../apollo/bootstrapApollo';
import { FullScreenLoading } from '../../../components/Loading';
import { ScreenWithHeader } from '../../../components/Screen';
import { Categories, Logger } from '../../../helper/Logger';
import { I18N } from '../../../i18n/translation';
import { Features, isFeatureEnabled } from '../../../model/Features';
import { IAppState } from '../../../model/IAppState';
import { SettingsState } from '../../../model/state/SettingsState';
import { TestPushMutation } from '../../../queries/Admin/TestPushMutation';
import { SettingsType, updateSetting } from '../../../redux/actions/settings';
import { registerForPushNotifications } from '../../../tasks/registerForPushNotifications';
import { Action } from './Action';
import { Element } from './Element';
import { styles } from './Styles';

const logger = new Logger(Categories.Screens.Setting);

type State = {
    wait: boolean,
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    settings: SettingsState,
};

type DispatchPros = {
    updateSetting: typeof updateSetting;
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps;

class NotificationsSettingsScreenBase extends AuditedScreen<Props, State> {
    state = {
        wait: false,
    };

    constructor(props) {
        super(props, AuditScreenName.NotificationSettings);
    }

    updateSetting(type: SettingsType) {
        logger.debug(type);

        if (this.props.settings[type.name] === type.value) {
            logger.debug('Setting is equal, skipping');
            return;
        }

        this.audit.trackAction(ActionNames.ChangeSetting, {
            [AuditPropertyNames.Setting]: type.name,
            [AuditPropertyNames.SettingValue]: (type.value || '').toString(),
        });

        this.props.updateSetting(type);
    }

    _toggleBirthdayNotifications = async () => {
        if (await this._registerPushNotifications(false)) {
            this.updateSetting({
                name: 'notificationsBirthdays',
                value: !this.props.settings.notificationsBirthdays,
            });
        }
    }

    _toggleOneToOne = async () => {
        if (await this._registerPushNotifications(false)) {

            this.updateSetting({
                name: 'notificationsOneToOneChat',
                value: !this.props.settings.notificationsOneToOneChat,
            });
        }
    }

    _registerPushNotifications = async (force: boolean = true) => {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);

        if (status !== 'granted' && Constants.isDevice) {
            Alert.alert(I18N.Component_Notifications.Settings.push.permissions);
            return false;
        }

        await registerForPushNotifications(force);

        if (force) {
            // forces a value push to server
            this.updateSetting({
                name: 'notificationsBirthdays',
                value: this.props.settings.notificationsBirthdays == null
                    ? true
                    : this.props.settings.notificationsBirthdays,
            });

            try {
                const client = cachedAolloClient();
                await client.mutate({
                    mutation: TestPushMutation,
                });
            } catch (e) {
                logger.error('settings-testpush', e);
            }
        }

        return true;
    }

    render() {
        return (
            <>
                <ScreenWithHeader header={{ title: I18N.Component_Notifications.Settings.title, showBack: true }}>
                    <ScrollView>
                        <List.Section title={I18N.Component_Notifications.Settings.birthday.title}>
                            <Divider />
                            <Element
                                theme={this.props.theme}
                                field={I18N.Component_Notifications.Settings.birthday.field}
                                text={(
                                    <Switch
                                        color={this.props.theme.colors.accent}
                                        style={{ marginTop: -4, marginRight: -4 }}
                                        value={this.props.settings.notificationsBirthdays}
                                        onValueChange={this._toggleBirthdayNotifications}
                                    />
                                )}
                            />
                            <Divider />
                        </List.Section>

                        {isFeatureEnabled(Features.Chat) && (
                            <List.Section title={I18N.Component_Notifications.Settings.onetoone.title}>
                                <Text style={styles.text}>{I18N.Component_Notifications.Settings.onetoone.text}</Text>
                                <Divider />
                                <Element
                                    theme={this.props.theme}
                                    field={I18N.Component_Notifications.Settings.onetoone.field}
                                    text={(
                                        <Switch
                                            color={this.props.theme.colors.accent}
                                            style={{ marginTop: -4, marginRight: -4 }}
                                            value={this.props.settings.notificationsOneToOneChat}
                                            onValueChange={this._toggleOneToOne}
                                        />
                                    )}
                                />
                                <Divider />
                            </List.Section>
                        )}

                        <List.Section title={I18N.Component_Notifications.Settings.push.title}>
                            <Divider />
                            <Action theme={this.props.theme} text={I18N.Component_Notifications.Settings.push.action} onPress={this._registerPushNotifications} />
                        </List.Section>

                        <View style={{ height: 50 }} />
                    </ScrollView>
                </ScreenWithHeader>
                {this.state.wait && (
                    <Portal>
                        <>
                            <View style={[StyleSheet.absoluteFill, { backgroundColor: this.props.theme.colors.backdrop, opacity: 0.8 }]} />
                            <FullScreenLoading />
                        </>
                    </Portal>
                )}
            </>
        );
    }
}

// tslint:disable-next-line: export-name
export const NotificationsSettingsScreen = connect<StateProps, DispatchPros, OwnProps, IAppState>(
    (state) => ({
        settings: state.settings,
    }),
    {
        updateSetting,
    })(withTheme(NotificationsSettingsScreenBase));
