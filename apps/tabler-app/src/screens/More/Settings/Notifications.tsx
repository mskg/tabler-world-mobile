import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, List, Portal, Switch, Text, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { ActionNames } from '../../../analytics/ActionNames';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditPropertyNames } from '../../../analytics/AuditPropertyNames';
import { AuditScreenName } from '../../../analytics/AuditScreenName';
import { FullScreenLoading } from '../../../components/Loading';
import { ScreenWithHeader } from '../../../components/Screen';
import { Categories, Logger } from '../../../helper/Logger';
import { I18N } from '../../../i18n/translation';
import { IAppState } from '../../../model/IAppState';
import { SettingsState } from '../../../model/state/SettingsState';
import { SettingsType, updateSetting } from '../../../redux/actions/settings';
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

    // componentDidMount() {
    //     this.buildSMSOptions();
    //     this.buildMail();
    //     this.buildWebOptions();
    //     this.buildCallOptions();
    //     this.checkDemoMode();

    //     this.audit.submit();
    // }

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
        this.updateSetting({
            name: 'notificationsBirthdays',
            value: !this.props.settings.notificationsBirthdays,
        });
    }

    _toggleOneToOne = async () => {
        this.updateSetting({
            name: 'notificationsOneToOneChat',
            value: !this.props.settings.notificationsOneToOneChat,
        });
    }

    render() {
        return (
            <>
                <ScreenWithHeader header={{ title: I18N.Notifications.Settings.title, showBack: true }}>
                    <ScrollView>
                        <List.Section title={I18N.Notifications.Settings.birthday.title}>
                            <Divider />
                            <Element
                                theme={this.props.theme}
                                field={I18N.Notifications.Settings.birthday.field}
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

                        <List.Section title={I18N.Notifications.Settings.onetoone.title}>
                            <Text style={styles.text}>{I18N.Notifications.Settings.onetoone.text}</Text>
                            <Divider />
                            <Element
                                theme={this.props.theme}
                                field={I18N.Notifications.Settings.onetoone.field}
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
