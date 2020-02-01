import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import React, { PureComponent } from 'react';
import { Alert, Dimensions, Linking, Platform, View } from 'react-native';
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
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    nearbyMembersEnabled?: boolean,
    isOffline: boolean,
    currentLocation?: Location.LocationData,
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
        this.state = {};
    }

    _focus = () => {
        logger.debug('_focus startWatchNearby');
        this.props.startWatchNearby();
    }

    _blur = () => {
        logger.debug('_blur stopWatchNearby');
        this.props.stopWatchNearby();
    }

    // wen went from foreground to background
    _onAppActive = () => {
        logger.debug('_onAppActive');
        this._focus();
        this.didFocus();
    }

    async didFocus() {
        // prevent checking if not enabled
        if (!this.props.nearbyMembersEnabled) {
            return;
        }

        this.props.startWatchNearby();

        if (!await Location.isBackgroundLocationAvailableAsync()) {
            this.setState({ message: I18N.NearbyMembers.notsupported, canSet: false });
            return;
        }

        const result = await Permissions.askAsync(Permissions.LOCATION);

        if (result.status !== 'granted') {
            this.setState({
                message: I18N.NearbyMembers.permissions,
                canSet: Platform.OS === 'ios',
            });

            return;
        }

        if (Platform.OS === 'ios' && (!result.permissions.location || !result.permissions.location.ios || result.permissions.location.ios.scope !== 'always')) {
            this.setState({
                message: I18N.NearbyMembers.always,
                canSet: Platform.OS === 'ios',
            });

            return;
        }

        if (this.state.message) {
            this.setState({ message: undefined });
        }
    }

    _tryopen = () => {
        Linking.canOpenURL('app-settings:').then((supported) => {
            if (!supported) {
                logger.log('Can\'t handle settings url');
            } else {
                Linking.openURL('app-settings:');
            }
        }).catch(logger.error);
    }

    _enable = async () => {
        this.setState({ enabling: true });

        try {
            await enableNearbyTablers();
            // this.props.startWatchNearby();
        } catch {
            // tslint:disable-next-line: no-empty
            try { disableNearbyTablers(); } catch { }
            // this.props.stopWatchNearby();

            Alert.alert(I18N.Settings.locationfailed);
        }

        this.setState({ enabling: false });
        this.didFocus();
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
                        text={I18N.NearbyMembers.off}
                        button={I18N.NearbyMembers.on}
                        onPress={this._enable}
                    />
                )}

                {!this.state.enabling && this.props.nearbyMembersEnabled && !this.props.isOffline && this.state.message && (
                    <Message
                        theme={this.props.theme}
                        text={this.state.message}
                        button={this.state.canSet ? I18N.NearbyMembers.setlocation : undefined}
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
