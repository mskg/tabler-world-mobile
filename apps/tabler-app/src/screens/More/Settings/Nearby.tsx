import * as Permissions from 'expo-permissions';
import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Divider, List, Portal, Switch, Text, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { ActionNames } from '../../../analytics/ActionNames';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditPropertyNames } from '../../../analytics/AuditPropertyNames';
import { AuditScreenName } from '../../../analytics/AuditScreenName';
import { cachedAolloClient } from '../../../apollo/bootstrapApollo';
import { FullScreenLoading } from '../../../components/Loading';
import { ScreenWithHeader } from '../../../components/Screen';
import { disableNearbyTablers } from '../../../helper/geo/disable';
import { enableNearbyTablers } from '../../../helper/geo/enable';
import { Categories, Logger } from '../../../helper/Logger';
import { I18N } from '../../../i18n/translation';
import { Features, isFeatureEnabled } from '../../../model/Features';
import { SetLocationServicesOnMap, SetLocationServicesOnMapVariables } from '../../../model/graphql/SetLocationServicesOnMap';
import { IAppState } from '../../../model/IAppState';
import { SettingsState } from '../../../model/state/SettingsState';
import { SetLocationServicesOnMapMutation } from '../../../queries/Location/SetLocationServicesOnMapMutation';
import { SettingsType, updateSetting } from '../../../redux/actions/settings';
import { removeTasks, runTasks } from '../../../tasks/bootstrapTasks';
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

class NearbySettingsScreenBase extends AuditedScreen<Props, State> {
    state = {
        wait: false,
    };

    constructor(props) {
        super(props, AuditScreenName.NearbySettings);
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

    _toggleOwnClub = async () => {
        this.updateSetting({
            name: 'hideOwnClubWhenNearby',
            value: !this.props.settings.hideOwnClubWhenNearby,
        });
    }

    _toggleMap = async () => {
        try {
            const service = cachedAolloClient();
            await service.mutate<SetLocationServicesOnMap, SetLocationServicesOnMapVariables>({
                mutation: SetLocationServicesOnMapMutation,
                variables: {
                    state: !this.props.settings.nearbyMembersMap,
                },
            });

            this.updateSetting({
                name: 'nearbyMembersMap',
                value: !this.props.settings.nearbyMembersMap,
            });
        } catch (e) {
            Alert.alert(I18N.Screen_Settings.mapfailed);
        }
    }

    _toggleForeground = async () => {
        this.updateSetting({
            name: 'useForegroundService',
            value: !this.props.settings.useForegroundService,
        });

        this.setState({ wait: true }, async () => {
            try {
                await removeTasks();
                await runTasks();

                this.setState({ wait: false });
            } catch {
                Alert.alert(I18N.Screen_Settings.locationfailed);
            }
        });
    }

    _toggleLocationServices = async () => {
        const { status } = await Permissions.askAsync(Permissions.LOCATION);

        if (status !== 'granted') {
            Alert.alert(I18N.Screen_Settings.locationpermission);
            this.updateSetting({ name: 'nearbyMembers', value: false });
        } else {
            this.setState({ wait: true }, async () => {
                try {
                    // switch is flipped
                    if (!this.props.settings.nearbyMembers) {
                        await enableNearbyTablers();

                        this.audit.trackAction(ActionNames.ChangeSetting, {
                            [AuditPropertyNames.Setting]: 'nearbyMembers',
                            [AuditPropertyNames.SettingValue]: true.toString(),
                        });
                    } else {
                        await disableNearbyTablers();
                    }
                } catch {
                    if (!this.props.settings.nearbyMembers) {
                        try { disableNearbyTablers(); } catch { }
                    }

                    Alert.alert(I18N.Screen_Settings.locationfailed);
                }

                this.setState({ wait: false });
            });
        }
    }

    // tslint:disable-next-line: max-func-body-length
    render() {
        return (
            <>
                <ScreenWithHeader header={{ title: I18N.Screen_NearbyMembers.Settings.title, showBack: true }}>
                    <ScrollView>
                        {/* {this.state.demoMode &&
                            <Banner
                                visible={true}
                                actions={[
                                    {
                                        // @ts-ignore We provide a Text to color it
                                        label: <NativeText style={{ color: this.props.theme.colors.accent }}>{I18N.Settings.logout.button}</NativeText>,
                                        onPress: this._confirmUnload,
                                    },
                                ]}
                                image={({ size }) =>
                                    <Ionicons name="md-alert-circle" size={size} color={this.props.theme.colors.accent} />
                                }
                            >
                                {I18N.Settings.logout.demo}
                            </Banner>
                        } */}

                        <List.Section title={I18N.Screen_NearbyMembers.Settings.on.title}>
                            <Text style={styles.text}>{I18N.Screen_NearbyMembers.Settings.on.text}</Text>
                            <Divider />
                            <Element
                                theme={this.props.theme}
                                field={I18N.Screen_NearbyMembers.Settings.on.field}
                                text={(
                                    <Switch
                                        color={this.props.theme.colors.accent}
                                        style={{ marginTop: -4, marginRight: -4 }}
                                        value={this.props.settings.nearbyMembers}
                                        onValueChange={this._toggleLocationServices}
                                    />
                                )}
                            />
                            <Divider />

                            {isFeatureEnabled(Features.ToggleForegroundLocation) && (
                                <>
                                    <View style={{ paddingTop: 16 }} />
                                    <Text style={styles.text}>{I18N.Screen_NearbyMembers.Settings.foreground.text}</Text>
                                    <Divider />
                                    <Element
                                        theme={this.props.theme}
                                        field={I18N.Screen_NearbyMembers.Settings.foreground.field}
                                        text={(
                                            <Switch
                                                color={this.props.theme.colors.accent}
                                                disabled={!this.props.settings.nearbyMembers}
                                                style={{ marginTop: -4, marginRight: -4 }}
                                                value={this.props.settings.nearbyMembers && this.props.settings.useForegroundService}
                                                onValueChange={this._toggleForeground}
                                            />
                                        )}
                                    />
                                    <Divider />
                                </>
                            )}
                        </List.Section>

                        <List.Section title={I18N.Screen_NearbyMembers.Settings.map.title}>
                            <Text style={styles.text}>{I18N.Screen_NearbyMembers.Settings.map.text}</Text>
                            <Divider />
                            <Element
                                theme={this.props.theme}
                                field={I18N.Screen_NearbyMembers.Settings.map.field}
                                text={(
                                    <Switch
                                        color={this.props.theme.colors.accent}
                                        style={{ marginTop: -4, marginRight: -4 }}
                                        value={this.props.settings.nearbyMembers && this.props.settings.nearbyMembersMap}
                                        disabled={!this.props.settings.nearbyMembers}
                                        onValueChange={this._toggleMap}
                                    />
                                )}
                            />
                            <Divider />
                        </List.Section>

                        <List.Section title={I18N.Screen_NearbyMembers.Settings.filter.title}>
                            <Divider />
                            <Element
                                theme={this.props.theme}
                                field={I18N.Screen_NearbyMembers.Settings.filter.field}
                                text={(
                                    <Switch
                                        color={this.props.theme.colors.accent}
                                        style={{ marginTop: -4, marginRight: -4 }}
                                        value={this.props.settings.hideOwnClubWhenNearby}
                                        onValueChange={this._toggleOwnClub}
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
export const NearbySettingsScreen = connect<StateProps, DispatchPros, OwnProps, IAppState>(
    (state) => ({
        settings: state.settings,
    }),
    {
        updateSetting,
    })(withNavigation(withTheme(NearbySettingsScreenBase)));