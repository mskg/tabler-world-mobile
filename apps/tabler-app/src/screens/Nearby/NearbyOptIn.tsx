import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import React, { PureComponent } from 'react';
import { Alert, Dimensions, Linking, PermissionsAndroid, Platform, View } from 'react-native';
import { Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { HandleAppState } from '../../components/HandleAppState';
import { HandleScreenState } from '../../components/HandleScreenState';
import { CannotLoadWhileOffline } from '../../components/NoResults';
import { disableNearbyTablers } from '../../helper/geo/disable';
import { enableNearbyTablers } from '../../helper/geo/enable';
import { I18N } from '../../i18n/translation';
import { Features, isFeatureEnabled } from '../../model/Features';
import { IAppState } from '../../model/IAppState';
import { startWatchNearby, stopWatchNearby } from '../../redux/actions/location';
import { showNearbySettings } from '../../redux/actions/navigation';
import { updateSetting } from '../../redux/actions/settings';
import { BOTTOM_HEIGHT, TOTAL_HEADER_HEIGHT } from '../../theme/dimensions';
import { MemberListPlaceholder } from './List/MemberListPlaceholder';
import { logger } from './logger';
import { Message } from './Message';

type State = {
    message?: string,
    canSet?: boolean,
    enabling?: boolean,
    checkedonce?: boolean,
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    nearbyMembersEnabled?: boolean,
    isOffline: boolean,
    currentLocation?: LocationObject,
};

type DispatchPros = {
    updateSetting: typeof updateSetting;
    showNearbySettings: typeof showNearbySettings;

    startWatchNearby: typeof startWatchNearby;
    stopWatchNearby: typeof stopWatchNearby;
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps<unknown>;

const MAX_HEIGHT = Dimensions.get('window').height - TOTAL_HEADER_HEIGHT - BOTTOM_HEIGHT;

class NearbyOptInBase extends PureComponent<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            checkedonce: false,
        };
    }

    _focus = async () => {
        logger.debug('_focus startWatchNearby');

        if (!this.state.checkedonce) {
            await this.evaluatePermissions();
        }

        if (this.props.nearbyMembersEnabled) {
            this.props.startWatchNearby();
        }
    }

    _blur = () => {
        logger.debug('_blur stopWatchNearby');
        this.props.stopWatchNearby();
    }

    // wen went from foreground to background
    _onAppActive = async () => {
        logger.debug('_onAppActive');

        await this.evaluatePermissions();

        if (this.state.enabling) {
            await this._enable(false);
        } else {
            this._focus();
        }
    }

    async checkAndroidBackgroundPermission(): Promise<boolean> {
        logger.debug('Android?', Platform.OS, 'Version?', Platform.Version);
        if (Platform.OS === 'android' && Platform.Version >= 29) { // Android 10
            const androidResult = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            );

            logger.debug('checkAndroidBackgroundPermission result is', androidResult);
            return androidResult;
        }

        return true;
    }

    async evaluatePermissions() {
        // prevent checking if not enabled
        if (!this.props.nearbyMembersEnabled) {
            return;
        }

        if (!await Location.isBackgroundLocationAvailableAsync() && !isFeatureEnabled(Features.LocationWithoutBackground)) {
            this.setState({ message: I18N.Screen_NearbyMembers.notsupported, canSet: false, checkedonce: true });
            return;
        }

        if (!(await this.checkAndroidBackgroundPermission())) {
            this.setState({
                message: I18N.Screen_NearbyMembers.always,
                canSet: true,
                checkedonce: true,
            });

            return;
        }

        const result = await Location.getPermissionsAsync();
        logger.log('Permissiong result is', result);

        if (result.status !== 'granted') {
            this.setState({
                message: I18N.Screen_NearbyMembers.permissions,
                canSet: Platform.OS === 'ios',
                checkedonce: true,
            });

            return;
        }

        if (!isFeatureEnabled(Features.LocationWithoutAlways)) {
            if (Platform.OS === 'ios' && result.scope !== 'always') {
                logger.log('scope does not match', result.scope);

                this.setState({
                    message: I18N.Screen_NearbyMembers.always,
                    canSet: Platform.OS === 'ios',
                    checkedonce: true,
                });

                return;
            }
        }

        this.props.startWatchNearby();

        if (this.state.message) {
            logger.debug('removing message');
            this.setState({ message: undefined, checkedonce: true });
        }
    }

    _tryopen = () => {
        if (Platform.OS === 'android') {
            this._enable(true);
        } else {
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
    }

    _enable = async (force = true) => {
        logger.debug('_enable');
        this.setState({ enabling: true });

        try {
            await enableNearbyTablers(force);
            // this.props.startWatchNearby();
        } catch (e) {
            logger.error('enable nearby tablers', e);

            // tslint:disable-next-line: no-empty
            try { disableNearbyTablers(); } catch { }
            // this.props.stopWatchNearby();

            Alert.alert(I18N.Screen_Settings.locationfailed);
        }

        this.setState({ enabling: false });
        this.evaluatePermissions();
    }

    render() {
        // logger.log(
        //     0, this.props.nearbyMembersEnabled && !this.props.isOffline && !this.state.message && this.props.currentLocation,
        //     1, this.props.isOffline,
        //     2, this.state.enabling,
        //     3, !this.state.enabling && !this.props.nearbyMembersEnabled && !this.props.isOffline,
        //     4, !this.state.enabling && this.props.nearbyMembersEnabled && !this.props.isOffline && this.state.message,
        // );

        if (
            this.props.nearbyMembersEnabled
            && !this.props.isOffline
            && !this.state.message
            && this.props.currentLocation) {
            return (
                <>
                    <HandleAppState onActive={this._onAppActive} onInactive={this._blur} />
                    <HandleScreenState onFocus={this._focus} triggerOnFirstMount={true} onBlur={this._blur} triggerOnUnmount={true} />
                </>
            );
        }

        // we are rendering over the screens below. Such, we consume all available height
        // to not get influened by the flex layout (screen) below
        return (
            <View style={{ height: MAX_HEIGHT, backgroundColor: this.props.theme.colors.background }}>
                <HandleAppState onActive={this._onAppActive} onInactive={this._blur} />
                <HandleScreenState onFocus={this._focus} triggerOnFirstMount={true} onBlur={this._blur} triggerOnUnmount={true} />

                {this.props.isOffline &&
                    <CannotLoadWhileOffline />
                }

                {this.state.enabling &&
                    <MemberListPlaceholder />
                }

                {!this.state.enabling && !this.props.nearbyMembersEnabled && !this.props.isOffline && (
                    <Message
                        theme={this.props.theme}
                        text={I18N.Screen_NearbyMembers.off}
                        button={I18N.Screen_NearbyMembers.on}
                        onPress={this._enable}
                    />
                )}

                {!this.state.enabling && this.props.nearbyMembersEnabled && !this.props.isOffline && this.state.message && (
                    <Message
                        theme={this.props.theme}
                        text={this.state.message}
                        button={this.state.canSet ? I18N.Screen_NearbyMembers.setlocation : undefined}
                        onPress={this._tryopen}
                    />
                )}
            </View>
        );
    }
}

export const NearbyOptIn = connect<StateProps, DispatchPros, OwnProps, IAppState>(
    (state) => ({
        nearbyMembersEnabled: state.settings.nearbyMembers,
        isOffline: state.connection.offline,
        currentLocation: state.location.location,
    }),
    {
        updateSetting,
        showNearbySettings,

        startWatchNearby,
        stopWatchNearby,
    },
)(
    withWhoopsErrorBoundary(
        withNavigation(
            withTheme(NearbyOptInBase),
        ),
    ),
);
