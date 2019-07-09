import { Ionicons } from '@expo/vector-icons';
import { Updates } from 'expo';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import React from 'react';
import { Alert, ScrollView, Text as NativeText, View } from "react-native";
import { Banner, Divider, List, Switch, Text, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { ActionNames } from '../../analytics/ActionNames';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditPropertyNames } from '../../analytics/AuditPropertyNames';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { cachedAolloClient, getPersistor } from '../../apollo/bootstrapApollo';
import Assets from '../../Assets';
import { ScreenWithHeader } from '../../components/Screen';
import { isDemoModeEnabled } from '../../helper/demoMode';
import { LinkingHelper } from '../../helper/LinkingHelper';
import { Categories, Logger } from '../../helper/Logger';
import { I18N } from '../../i18n/translation';
import { Features, isFeatureEnabled } from '../../model/Features';
import { IAppState } from '../../model/IAppState';
import { SettingsState } from "../../model/state/SettingsState";
import { SettingsType, updateSetting } from '../../redux/actions/settings';
import { logoutUser } from '../../redux/actions/user';
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
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps;

class MainSettingsScreenBase extends AuditedScreen<Props, State> {
    state = {
        smsOptions: [{ label: "", value: "", }],
        browserOptions: [{ label: "", value: "", }],
        callOptions: [{ label: "", value: "", }],
        emailOptions: [{ label: "", value: "", }],
        showExperiments: false,
        demoMode: false,
    };

    constructor(props) {
        super(props, AuditScreenName.Settings);
    }

    componentDidMount() {
        this.buildSMSOptions();
        this.buildMail();
        this.buildWebOptions();
        this.buildCallOptions();
        this.checkDemoMode();

        this.audit.submit();
    }

    _clearSyncFlags = () => {
        Alert.alert(
            I18N.Settings.sync.title,
            I18N.Settings.sync.text,
            [
                {
                    text: I18N.Settings.cancel,
                    style: 'cancel',
                },
                {
                    text: I18N.Settings.confirm,
                    style: 'destructive',
                    onPress: async () => {
                        this.audit.trackAction(ActionNames.RemoveData);

                        const client = cachedAolloClient();
                        await client.cache.reset();
                        await getPersistor().purge();

                        // this forces an update of existing views
                        client.writeData({
                            data: {
                                LastSync: {
                                    __typename: 'LastSync',
                                }
                            },
                        });
                    }
                },
            ],
        );
    }

    _confirmUnload = () => {
        Alert.alert(
            I18N.Settings.logout.title,
            I18N.Settings.logout.text,
            [
                {
                    text: I18N.Settings.cancel,
                    style: 'cancel',
                },
                {
                    text: I18N.Settings.confirm,
                    style: 'destructive',
                    onPress: () => {
                        this.audit.trackAction(ActionNames.Logout);
                        this.props.logoutUser();
                    }
                },
            ],
        );
    }

    _updateSyncFavorites = async () => {
        let { status } = await Permissions.askAsync(Permissions.CONTACTS);

        if (status !== 'granted') {
            Alert.alert(I18N.Settings.contactpermissions);
            this.updateSetting({ name: "syncFavorites", value: false });
        } else {
            this.updateSetting({ name: "syncFavorites", value: !this.props.settings.syncFavorites });
        }
    }

    _updateMode = async () => {
        this.updateSetting({ name: "darkMode", value: !this.props.settings.darkMode });
    }

    _updateExperimentAlbums = async () => {
        this.updateSetting({ name: "experiment_albums", value: !this.props.settings.experiment_albums });

        Alert.alert(
            I18N.Settings.reload.title,
            I18N.Settings.reload.text,
            [
                {
                    text: I18N.Settings.cancel,
                    style: 'cancel',
                },
                {
                    text: I18N.Settings.confirm,
                    style: 'destructive',
                    onPress: async () => {
                        await getPersistor().persist();
                        Updates.reloadFromCache();
                    }
                },
            ],
        );
    }

    _updateSyncOwntable = async () => {
        let { status } = await Permissions.askAsync(Permissions.CONTACTS);

        if (status !== 'granted') {
            Alert.alert(I18N.Settings.contactpermissions);
            this.updateSetting({ name: "syncOwnTable", value: false });
        } else {
            this.updateSetting({ name: "syncOwnTable", value: !this.props.settings.syncOwnTable });
        }
    }

    updateSetting(type: SettingsType) {
        logger.debug(type);

        if (this.props.settings[type.name] === type.value) {
            logger.debug("Setting is equal, skipping");
            return;
        }

        this.audit.trackAction(ActionNames.ChangeSetting, {
            [AuditPropertyNames.Setting]: type.name,
            [AuditPropertyNames.SettingValue]: (type.value || "").toString(),
        });

        this.props.updateSetting(type);
    }

    async buildSMSOptions() {
        const result: any[] = [];

        for (const app of await LinkingHelper.messagingApps()) {
            result.push({
                label: I18N.Settings.apps.messaging(app),
                value: app,
            });
        }

        this.setState({ smsOptions: result });
    }

    async buildMail() {
        const result: any[] = [];

        for (const app of await LinkingHelper.mailApps()) {
            result.push({
                label: I18N.Settings.apps.mail(app),
                value: app,
            });
        }

        this.setState({ emailOptions: result });
    }

    async buildWebOptions() {
        const result: any[] = [];

        for (const app of await LinkingHelper.webApps()) {
            result.push({
                label: I18N.Settings.apps.web(app),
                value: app,
            });
        }

        this.setState({ browserOptions: result });
    }

    async buildCallOptions() {
        const result: any[] = [];

        for (const app of await LinkingHelper.callApps()) {
            result.push({
                label: I18N.Settings.apps.call(app),
                value: app,
            });
        }

        this.setState({ callOptions: result });
    }

    async checkDemoMode() {
        const demo = await isDemoModeEnabled();
        this.setState({ showExperiments: !demo, demoMode: demo });
    }

    render() {
        return (
            <ScreenWithHeader header={{ title: I18N.Settings.title }}>
                <ScrollView>
                    {this.state.demoMode &&
                        <Banner
                            visible={true}
                            actions={[
                                {
                                    label: <NativeText style={{color: this.props.theme.colors.accent}}>{I18N.Settings.logout.button}</NativeText>,
                                    onPress: this._confirmUnload,
                                  },
                            ]}
                            image={({ size }) =>
                                <Ionicons name="md-alert" size={size} color={this.props.theme.colors.accent} />
                            }
                        >
                            {I18N.Settings.logout.demo}
                        </Banner>
                    }

                    <List.Section title={I18N.Settings.sections.about}>
                        <Divider />
                        <Element
                            theme={this.props.theme}
                            field={I18N.Settings.fields.version}
                            text={Constants.manifest.revisionId || '0.0.0'} />
                        <Divider />
                        <Element
                            theme={this.props.theme}
                            field={I18N.Settings.fields.channel}
                            text={Constants.manifest.releaseChannel || 'dev'} />
                        <Divider />

                        <NextScreen theme={this.props.theme} text={I18N.Settings.ReleaseNotes} onPress={
                            () => this.props.navigation.navigate(Routes.MD, {
                                title: I18N.Settings.ReleaseNotes,
                                source: Assets.files.releasenotes
                            })} />
                        <Divider />
                        <NextScreen theme={this.props.theme} text={I18N.Settings.Legal.title} onPress={
                            () => this.props.navigation.navigate(Routes.Legal)} />
                        <Divider />
                    </List.Section>

                    <List.Section title={I18N.Settings.sections.colors}>
                        <Divider />
                        <Element
                            theme={this.props.theme}
                            field={I18N.Settings.fields.dark}
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

                    <List.Section title={I18N.Settings.sections.apps}>
                        {this.state.callOptions.length > 0 &&
                            <>
                                <Divider />
                                <SelectionList
                                    theme={this.props.theme}
                                    field={I18N.Settings.fields.phone}
                                    items={this.state.callOptions}
                                    value={this.props.settings.phoneApp}
                                    onChange={(value: string) => {
                                        this.updateSetting({
                                            name: "phoneApp",
                                            value,
                                        })
                                    }}
                                />
                            </>
                        }

                        {this.state.smsOptions.length > 0 &&
                            <>
                                <Divider />
                                <SelectionList
                                    theme={this.props.theme}
                                    field={I18N.Settings.fields.sms}
                                    items={this.state.smsOptions}
                                    value={this.props.settings.messagingApp}
                                    onChange={(value: string) => {
                                        this.updateSetting({
                                            name: "messagingApp",
                                            value,
                                        })
                                    }}
                                />
                            </>
                        }

                        {this.state.browserOptions.length > 0 &&
                            <>
                                <Divider />
                                <SelectionList
                                    theme={this.props.theme}
                                    field={I18N.Settings.fields.web}
                                    items={this.state.browserOptions}
                                    value={this.props.settings.browserApp}
                                    onChange={(value: string) => {
                                        this.updateSetting({
                                            name: "browserApp",
                                            value,
                                        })
                                    }}
                                />
                            </>
                        }

                        {this.state.emailOptions.length > 0 &&
                            <>
                                <Divider />
                                <SelectionList
                                    theme={this.props.theme}
                                    field={I18N.Settings.fields.mail}
                                    items={this.state.emailOptions}
                                    value={this.props.settings.emailApp}
                                    onChange={(value: string) => {
                                        this.updateSetting({
                                            name: "emailApp",
                                            value,
                                        })
                                    }}
                                />
                                <Divider />
                            </>
                        }
                    </List.Section>

                    <List.Section title={I18N.Settings.sections.contacts}>
                        {/* <Divider />
                        <Element
                            theme={this.props.theme}
                            field={I18N.Settings.fields.lastSync}
                            text={I18N.Settings.sync.date(this.props.lastSync)} /> */}
                        <Divider />
                        <SelectionList
                            theme={this.props.theme}
                            field={I18N.Settings.fields.displayOrder}
                            items={[
                                { label: I18N.Settings.firstlast, value: "1" },
                                { label: I18N.Settings.lastfirst, value: "0" },
                            ]}
                            value={this.props.settings.diplayFirstNameFirst ? "1" : "0"}
                            onChange={value => {
                                this.updateSetting({
                                    name: "diplayFirstNameFirst", value: value == "1"
                                })
                            }}
                        />
                        <Divider />
                        <SelectionList
                            theme={this.props.theme}
                            field={I18N.Settings.fields.sortOrder}
                            items={[
                                { label: I18N.Settings.firstlast, value: "0" },
                                { label: I18N.Settings.lastfirst, value: "1" },
                            ]}
                            value={this.props.settings.sortByLastName ? "1" : "0"}
                            onChange={value => {
                                this.updateSetting({
                                    name: "sortByLastName", value: value == "1"
                                })
                            }}
                        />
                        <Divider />
                    </List.Section>

                    {isFeatureEnabled(Features.ContactSync) &&
                        <List.Section title={I18N.Settings.sections.sync}>
                            <Text style={styles.text}>{I18N.Settings.texts.contacts}</Text>

                            <Divider />
                            <Element
                                theme={this.props.theme}
                                field={I18N.Settings.fields.syncFavorites}
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
                                field={I18N.Settings.fields.syncOwnTable}
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

                    {this.state.showExperiments &&
                        <List.Section title={I18N.Settings.sections.experiments}>
                            <Text style={styles.text}>{I18N.Settings.texts.experiments}</Text>
                            <Divider />
                            <Element
                                theme={this.props.theme}
                                field={I18N.Settings.fields.experiment_albums}
                                text={
                                    <Switch
                                        color={this.props.theme.colors.accent}
                                        style={{ marginTop: -4, marginRight: -4 }}
                                        value={this.props.settings.experiment_albums}
                                        onValueChange={this._updateExperimentAlbums}
                                    />
                                }
                            />
                            <Divider />
                        </List.Section>
                    }

                    <List.Section title={I18N.Settings.sections.reset}>
                        <Divider />
                        <Action theme={this.props.theme} text={I18N.Settings.fields.clear} onPress={this._clearSyncFlags} />
                        <Divider />
                        <Action theme={this.props.theme} text={I18N.Settings.fields.logout} onPress={this._confirmUnload} />
                        <Divider />
                    </List.Section>

                    <View style={{ height: 50 }} />
                </ScrollView>
            </ScreenWithHeader>
        );
    }
}

export const MainSettingsScreen = connect<StateProps, DispatchPros, OwnProps, IAppState>(
    (state) => ({
        settings: state.settings
    }),
    {
        logoutUser,
        updateSetting,
    })(withNavigation(withTheme(MainSettingsScreenBase)));
