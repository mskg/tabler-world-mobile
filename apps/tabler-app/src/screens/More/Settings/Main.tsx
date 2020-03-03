import { Ionicons } from '@expo/vector-icons';
import { Updates } from 'expo';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import React from 'react';
import { Alert, ScrollView, Text as NativeText, View } from 'react-native';
import { Banner, Divider, List, Switch, Text, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { ActionNames } from '../../../analytics/ActionNames';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditPropertyNames } from '../../../analytics/AuditPropertyNames';
import { AuditScreenName } from '../../../analytics/AuditScreenName';
import { cachedAolloClient, getApolloCachePersistor } from '../../../apollo/bootstrapApollo';
import Assets from '../../../Assets';
import CacheManager from '../../../components/Image/CacheManager';
import { ScreenWithHeader } from '../../../components/Screen';
import { isDemoModeEnabled } from '../../../helper/demoMode';
import { formatCallApp } from '../../../helper/formatting/formatCallApp';
import { formatMailApp } from '../../../helper/formatting/formatMailApp';
import { formatMessagingApp } from '../../../helper/formatting/formatMessagingApp';
import { formatWebApp } from '../../../helper/formatting/formatWebApp';
import { LinkingHelper } from '../../../helper/LinkingHelper';
import { Categories, Logger } from '../../../helper/Logger';
import { I18N } from '../../../i18n/translation';
import { Features, isFeatureEnabled } from '../../../model/Features';
import { IAppState } from '../../../model/IAppState';
import { SettingsState } from '../../../model/state/SettingsState';
import { clearMessages } from '../../../redux/actions/chat';
import { showNearbySettings, showNotificationSettings } from '../../../redux/actions/navigation';
import { SettingsType, updateSetting } from '../../../redux/actions/settings';
import { logoutUser } from '../../../redux/actions/user';
import { Routes as ParentRoutes } from '../Routes';
import { Action, NextScreen } from './Action';
import { Element } from './Element';
import { Routes } from './Routes';
import { SelectionList } from './SelectionList';
import { styles } from './Styles';


const logger = new Logger(Categories.Screens.Setting);

type State = {
    smsOptions: any[],
    browserOptions: any[],
    callOptions: any[],
    emailOptions: any[],
    showExperiments: boolean,
    demoMode: boolean,
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    settings: SettingsState,
};

type DispatchPros = {
    logoutUser: typeof logoutUser;
    updateSetting: typeof updateSetting;
    showNearbySettings: typeof showNearbySettings;
    showNotificationSettings: typeof showNotificationSettings;
    clearMessages: typeof clearMessages;
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps;

class MainSettingsScreenBase extends AuditedScreen<Props, State> {
    state: State = {
        smsOptions: [{ label: '', value: '' }],
        browserOptions: [{ label: '', value: '' }],
        callOptions: [{ label: '', value: '' }],
        emailOptions: [{ label: '', value: '' }],

        showExperiments: false,
        demoMode: false,
    };

    constructor(props) {
        super(props, AuditScreenName.Settings);
    }

    async componentDidMount() {
        super.componentDidMount();

        this.buildSMSOptions();
        this.buildMail();
        this.buildWebOptions();
        this.buildCallOptions();
        this.checkDemoMode();
    }

    _clearSyncFlags = () => {
        Alert.alert(
            I18N.Screen_Settings.sync.title,
            I18N.Screen_Settings.sync.text,
            [
                {
                    text: I18N.Screen_Settings.cancel,
                    style: 'cancel',
                },
                {
                    text: I18N.Screen_Settings.confirm,
                    style: 'destructive',
                    onPress: async () => {
                        this.audit.trackAction(ActionNames.RemoveData);

                        const client = cachedAolloClient();
                        await client.cache.reset();

                        this.props.clearMessages();
                        await getApolloCachePersistor().purge();

                        // this forces an update of existing views
                        client.writeData({
                            data: {
                                LastSync: {
                                    __typename: 'LastSync',
                                },
                            },
                        });

                        Updates.reloadFromCache();
                    },
                },
            ],
        );
    }

    _clearCache = async () => {
        try {
            await CacheManager.clearCache('album');
            await CacheManager.clearCache('news');
            await CacheManager.clearCache('other');

            await CacheManager.outDateCache('avatar');
            await CacheManager.outDateCache('club');
        } catch (e) {
            logger.error('settings-clear-imagecache', e);
        }

        Alert.alert(
            I18N.Screen_Settings.cache.title,
        );
    }

    _confirmUnload = () => {
        Alert.alert(
            I18N.Screen_Settings.logout.title,
            I18N.Screen_Settings.logout.text,
            [
                {
                    text: I18N.Screen_Settings.cancel,
                    style: 'cancel',
                },
                {
                    text: I18N.Screen_Settings.confirm,
                    style: 'destructive',
                    onPress: () => {
                        this.audit.trackAction(ActionNames.Logout);
                        this.props.logoutUser();
                    },
                },
            ],
        );
    }

    _updateSyncFavorites = async () => {
        const { status } = await Permissions.askAsync(Permissions.CONTACTS);

        if (status !== 'granted') {
            Alert.alert(I18N.Screen_Settings.contactpermissions);
            this.updateSetting({ name: 'syncFavorites', value: false });
        } else {
            this.updateSetting({ name: 'syncFavorites', value: !this.props.settings.syncFavorites });
        }
    }

    _updateMode = async () => {
        this.updateSetting({ name: 'darkMode', value: !this.props.settings.darkMode });
    }

    _updateExperimentAlbums = async () => {
        this.updateSetting({ name: 'experiments', value: !this.props.settings.experiments });

        Alert.alert(
            I18N.Screen_Settings.reload.title,
            I18N.Screen_Settings.reload.text,
            [
                {
                    text: I18N.Screen_Settings.cancel,
                    style: 'cancel',
                },
                {
                    text: I18N.Screen_Settings.confirm,
                    style: 'destructive',
                    onPress: async () => {
                        await getApolloCachePersistor().persist();
                        Updates.reloadFromCache();
                    },
                },
            ],
        );
    }

    _updateSyncOwntable = async () => {
        const { status } = await Permissions.askAsync(Permissions.CONTACTS);

        if (status !== 'granted') {
            Alert.alert(I18N.Screen_Settings.contactpermissions);
            this.updateSetting({ name: 'syncOwnTable', value: false });
        } else {
            this.updateSetting({ name: 'syncOwnTable', value: !this.props.settings.syncOwnTable });
        }
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

    async buildSMSOptions() {
        const result: any[] = [];

        for (const app of await LinkingHelper.messagingApps()) {
            result.push({
                label: formatMessagingApp(app),
                value: app,
            });
        }

        this.setState({ smsOptions: result });
    }

    async buildMail() {
        const result: any[] = [];

        for (const app of await LinkingHelper.mailApps()) {
            result.push({
                label: formatMailApp(app),
                value: app,
            });
        }

        this.setState({ emailOptions: result });
    }

    async buildWebOptions() {
        const result: any[] = [];

        for (const app of await LinkingHelper.webApps()) {
            result.push({
                label: formatWebApp(app),
                value: app,
            });
        }

        this.setState({ browserOptions: result });
    }

    async buildCallOptions() {
        const result: any[] = [];

        for (const app of await LinkingHelper.callApps()) {
            result.push({
                label: formatCallApp(app),
                value: app,
            });
        }

        this.setState({ callOptions: result });
    }

    async checkDemoMode() {
        const demo = await isDemoModeEnabled();
        this.setState({ showExperiments: !demo, demoMode: demo });
    }

    // tslint:disable-next-line: max-func-body-length
    render() {
        return (
            <>
                <ScreenWithHeader header={{ title: I18N.Screen_Settings.title, showBack: true }}>
                    <ScrollView>
                        {this.state.demoMode && (
                            <Banner
                                visible={true}
                                actions={[
                                    {
                                        // @ts-ignore We provide a Text to color it
                                        label: <NativeText style={{ color: this.props.theme.colors.accent }}>{I18N.Screen_Settings.logout.button}</NativeText>,
                                        onPress: this._confirmUnload,
                                    },
                                ]}
                                image={({ size }) =>
                                    <Ionicons name="md-alert" size={size} color={this.props.theme.colors.accent} />
                                }
                            >
                                {I18N.Screen_Settings.logout.demo}
                            </Banner>
                        )}

                        <List.Section title={I18N.Screen_Settings.sections.about}>
                            <Divider />
                            <Element
                                theme={this.props.theme}
                                field={I18N.Screen_Settings.fields.version}
                                text={Constants.manifest.revisionId || '0.0.0'}
                            />

                            <Divider />
                            <Element
                                theme={this.props.theme}
                                field={I18N.Screen_Settings.fields.channel}
                                text={Constants.manifest.releaseChannel || 'dev'}
                            />

                            <Divider />
                            <Element
                                theme={this.props.theme}
                                field={I18N.Screen_Settings.fields.subscription}
                                text={I18N.Screen_Settings.fields.subscription_valid}
                            />

                            <Divider />
                            <NextScreen
                                theme={this.props.theme}
                                text={I18N.Screen_Settings.ReleaseNotes}
                                onPress={
                                    () => this.props.navigation.navigate(Routes.MD, {
                                        title: I18N.Screen_Settings.ReleaseNotes,
                                        source: Assets.files.releasenotes,
                                    })}
                            />

                            <Divider />
                            <NextScreen
                                theme={this.props.theme}
                                text={I18N.Screen_Settings.Legal.title}
                                onPress={
                                    () => this.props.navigation.navigate(Routes.Legal)}
                            />
                            <Divider />
                        </List.Section>

                        {isFeatureEnabled(Features.DarkModeSwitch) &&
                            <List.Section title={I18N.Screen_Settings.sections.colors}>
                                <Divider />
                                <Element
                                    theme={this.props.theme}
                                    field={I18N.Screen_Settings.fields.dark}
                                    text={
                                        <Switch
                                            color={this.props.theme.colors.accent}
                                            style={{ marginTop: -4, marginRight: -4 }}
                                            value={this.props.settings.darkMode}
                                            onValueChange={this._updateMode}
                                        />
                                    }
                                />
                                <Divider />
                            </List.Section>
                        }

                        <List.Section title={I18N.Screen_Settings.sections.apps}>
                            {this.state.callOptions.length > 0 &&
                                <>
                                    <Divider />
                                    <SelectionList
                                        theme={this.props.theme}
                                        field={I18N.Screen_Settings.fields.phone}
                                        items={this.state.callOptions}
                                        value={this.props.settings.phoneApp}
                                        onChange={(value: string) => {
                                            this.updateSetting({
                                                name: 'phoneApp',
                                                value,
                                            });
                                        }}
                                    />
                                </>
                            }

                            {this.state.smsOptions.length > 0 &&
                                <>
                                    <Divider />
                                    <SelectionList
                                        theme={this.props.theme}
                                        field={I18N.Screen_Settings.fields.sms}
                                        items={this.state.smsOptions}
                                        value={this.props.settings.messagingApp}
                                        onChange={(value: string) => {
                                            this.updateSetting({
                                                name: 'messagingApp',
                                                value,
                                            });
                                        }}
                                    />
                                </>
                            }

                            {this.state.browserOptions.length > 0 &&
                                <>
                                    <Divider />
                                    <SelectionList
                                        theme={this.props.theme}
                                        field={I18N.Screen_Settings.fields.web}
                                        items={this.state.browserOptions}
                                        value={this.props.settings.browserApp}
                                        onChange={(value: string) => {
                                            this.updateSetting({
                                                name: 'browserApp',
                                                value,
                                            });
                                        }}
                                    />
                                </>
                            }

                            {this.state.emailOptions.length > 0 &&
                                <>
                                    <Divider />
                                    <SelectionList
                                        theme={this.props.theme}
                                        field={I18N.Screen_Settings.fields.mail}
                                        items={this.state.emailOptions}
                                        value={this.props.settings.emailApp}
                                        onChange={(value: string) => {
                                            this.updateSetting({
                                                name: 'emailApp',
                                                value,
                                            });
                                        }}
                                    />
                                    <Divider />
                                </>
                            }
                        </List.Section>

                        <List.Section title={I18N.Screen_Settings.sections.contacts}>
                            {/* <Divider />
                        <Element
                            theme={this.props.theme}
                            field={I18N.Settings.fields.lastSync}
                            text={I18N.Settings.sync.date(this.props.lastSync)} /> */}
                            <Divider />
                            <SelectionList
                                theme={this.props.theme}
                                field={I18N.Screen_Settings.fields.displayOrder}
                                items={[
                                    { label: I18N.Screen_Settings.firstlast, value: '1' },
                                    { label: I18N.Screen_Settings.lastfirst, value: '0' },
                                ]}
                                value={this.props.settings.diplayFirstNameFirst ? '1' : '0'}
                                onChange={value => {
                                    this.updateSetting({
                                        name: 'diplayFirstNameFirst', value: value == '1',
                                    });
                                }}
                            />
                            <Divider />
                            <SelectionList
                                theme={this.props.theme}
                                field={I18N.Screen_Settings.fields.sortOrder}
                                items={[
                                    { label: I18N.Screen_Settings.firstlast, value: '0' },
                                    { label: I18N.Screen_Settings.lastfirst, value: '1' },
                                ]}
                                value={this.props.settings.sortByLastName ? '1' : '0'}
                                onChange={value => {
                                    this.updateSetting({
                                        name: 'sortByLastName', value: value == '1',
                                    });
                                }}
                            />
                            <Divider />
                        </List.Section>

                        {isFeatureEnabled(Features.ContactSync) &&
                            <List.Section title={I18N.Screen_Settings.sections.sync}>
                                <Text style={styles.text}>{I18N.Screen_Settings.texts.contacts}</Text>

                                <Divider />
                                <Element
                                    theme={this.props.theme}
                                    field={I18N.Screen_Settings.fields.syncFavorites}
                                    text={
                                        <Switch
                                            color={this.props.theme.colors.accent}
                                            style={{ marginTop: -4, marginRight: -4 }}
                                            value={this.props.settings.syncFavorites}
                                            onValueChange={this._updateSyncFavorites}
                                        />
                                    }
                                />
                                <Divider />
                                <Element
                                    theme={this.props.theme}
                                    field={I18N.Screen_Settings.fields.syncOwnTable}
                                    text={
                                        <Switch
                                            color={this.props.theme.colors.accent}
                                            style={{ marginTop: -4, marginRight: -4 }}
                                            value={this.props.settings.syncOwnTable}
                                            onValueChange={this._updateSyncOwntable}
                                        />
                                    } />
                                <Divider />
                            </List.Section>
                        }

                        <List.Section title={I18N.Component_Notifications.Settings.title}>
                            <Divider />
                            <NextScreen
                                theme={this.props.theme}
                                text={I18N.Screen_Settings.fields.notifications}
                                onPress={
                                    () => this.props.showNotificationSettings()}
                            />
                            <Divider />
                        </List.Section>

                        <List.Section title={I18N.Screen_Settings.sections.locationservices}>
                            <Divider />
                            <NextScreen
                                theme={this.props.theme}
                                text={I18N.Screen_Settings.fields.nearby}
                                onPress={
                                    () => this.props.navigation.navigate(ParentRoutes.NearbySettings)
                                }
                            />
                            <Divider />
                        </List.Section>

                        {this.state.showExperiments &&
                            <List.Section title={I18N.Screen_Settings.sections.experiments}>
                                <Text style={styles.text}>{I18N.Screen_Settings.texts.experiments}</Text>
                                <Divider />
                                <Element
                                    theme={this.props.theme}
                                    field={I18N.Screen_Settings.fields.experiments}
                                    text={
                                        <Switch
                                            color={this.props.theme.colors.accent}
                                            style={{ marginTop: -4, marginRight: -4 }}
                                            value={this.props.settings.experiments}
                                            onValueChange={this._updateExperimentAlbums}
                                        />
                                    }
                                />
                                <Divider />
                            </List.Section>
                        }

                        <List.Section title={I18N.Screen_Settings.sections.reset}>
                            <Divider />
                            <Action theme={this.props.theme} text={I18N.Screen_Settings.fields.clear} onPress={this._clearSyncFlags} />
                            <Divider />
                            <Action theme={this.props.theme} text={I18N.Screen_Settings.fields.cache} onPress={this._clearCache} />
                            <Divider />
                            <Action theme={this.props.theme} text={I18N.Screen_Settings.fields.logout} onPress={this._confirmUnload} />
                            <Divider />
                        </List.Section>

                        <View style={{ height: 50 }} />
                    </ScrollView>
                </ScreenWithHeader>
            </>
        );
    }
}

export const MainSettingsScreen = connect<StateProps, DispatchPros, OwnProps, IAppState>(
    (state) => ({
        settings: state.settings,
    }),
    {
        logoutUser,
        updateSetting,
        showNearbySettings,
        showNotificationSettings,
        clearMessages,
    })(withNavigation(withTheme(MainSettingsScreenBase)));
