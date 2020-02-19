import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import _, { remove } from 'lodash';
import React from 'react';
import { View } from 'react-native';
import MapView, { AnimatedRegion, MarkerAnimated, Region } from 'react-native-maps';
import { FAB, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditScreenName } from '../../../analytics/AuditScreenName';
import { withWhoopsErrorBoundary } from '../../../components/ErrorBoundary';
import { TapOnNavigationParams } from '../../../components/ReloadNavigationOptions';
import { I18N } from '../../../i18n/translation';
import { NearbyMembers_nearbyMembers } from '../../../model/graphql/NearbyMembers';
import { IAppState } from '../../../model/IAppState';
import { showNearbySettings, showProfile } from '../../../redux/actions/navigation';
import { darkStyles } from '../../Structure/Clubs/darkStyles';
import { styles } from '../../Structure/Styles';
import { Message } from '../Message';
import { NearbyEnabled } from '../NearbyEnabled';
import { Pin } from './Pin';

type State = {
    location?: Location.LocationData,
    centerOn?: Region,
    marginBottom: number,
    regionChanged: boolean,

    members: {
        member: NearbyMembers_nearbyMembers,
        coordinates: AnimatedRegion,
    }[],
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    location?: Location.LocationData,
    members?: NearbyMembers_nearbyMembers[],
    nearbyMap: boolean,
};

type DispatchPros = {
    showProfile: typeof showProfile,
    showNearbySettings: typeof showNearbySettings,
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps<TapOnNavigationParams>;

class NearbyMapScreenBase extends AuditedScreen<Props, State> {
    mapRef: MapView | null = null;

    constructor(props) {
        super(props, AuditScreenName.NearbyMembersMap);

        this.state = {
            marginBottom: 1,
            regionChanged: false,
            members: [],
        };

        this.mergeMembers(this.props.members);
    }

    componentDidMount() {
        super.componentDidMount();

        if (this.props.nearbyMap) {
            this._getLocationAsync();
        }

        this.props.navigation.setParams({
            tapOnTabNavigator: () => requestAnimationFrame(this._fitMap),
        });
    }

    _onMapReady = () => this.setState({ marginBottom: 0 });
    _onRegionChanged = () => {
        if (!this.state.regionChanged) {
            this.setState({ regionChanged: true });
        }
    }

    _getLocationAsync = async () => {
        const { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            return;
        }

        const location = await Location.getCurrentPositionAsync({});
        this.setState({
            location,
            centerOn: {
                longitude: location.coords.longitude,
                latitude: location.coords.latitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            },
        });

        this._fitMap();
    }

    mergeMembers(members?: NearbyMembers_nearbyMembers[]) {
        const newMembers = (members || []).filter((f) => f.location);
        newMembers.forEach(this.mergeMember.bind(this));

        if (this.props.members) {
            remove(
                this.state.members,
                // @ts-ignore
                (state) => newMembers.find((props) => props.member.id === state.member.member.id) === null,
            );
        }
    }

    mergeMember(member: NearbyMembers_nearbyMembers) {
        const existing = this.state.members.find((m) => m.member.member.id === member.member.id);

        if (existing) {
            if (existing.member.location!.latitude !== member.location!.latitude
                || existing.member.location!.longitude !== member.location!.longitude
            ) {
                existing.coordinates.timing({
                    ...member.location,
                    duration: 2000,
                }).start();
            } else if (__DEV__) {
                existing.coordinates.timing({
                    ...member.location,
                    latitude: member.location!.latitude + Math.random() / 100,
                    duration: 2000,
                }).start();
            }

            Object.assign(existing.member, member);
        } else {
            this.state.members.push({
                member,
                // @ts-ignore
                coordinates: new AnimatedRegion({
                    ...member.location,
                    latitudeDelta: 0,
                    longitudeDelta: 0,
                }),
            });
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.members !== this.props.members) {
            this.mergeMembers(this.props.members);
        }

        if (!prevProps.nearbyMap && this.props.nearbyMap) {
            this._fitMap();
        } else if ((!prevProps.members || prevProps.members.length === 0) && (this.props.members && this.props.members.length > 0)) {
            this._fitMap();
        }
    }

    _fitMap = _.debounce(
        () => {
            if (this.mapRef && this.props.members) {
                this.mapRef.fitToSuppliedMarkers(
                    this.props.members.map((d) => d.member.id.toString()),
                );
            }
        },
        1000,
    );

    render() {
        return (
            <NearbyEnabled>
                <View style={{ flex: 1, backgroundColor: this.props.theme.colors.background }}>
                    {!this.props.nearbyMap && (
                        <Message
                            theme={this.props.theme}
                            text={I18N.Screen_NearbyMembers.mapOff}
                            button={I18N.Screen_NearbyMembers.on}
                            onPress={() => this.props.showNearbySettings()}
                        />
                    )}

                    {this.props.nearbyMap && (
                        <>
                            <MapView
                                ref={(ref) => { this.mapRef = ref; }}

                                zoomEnabled={true}
                                scrollEnabled={true}
                                region={this.state.regionChanged ? undefined : this.state.centerOn}

                                showsUserLocation={true}

                                showsMyLocationButton={false}
                                showsCompass={false}

                                loadingEnabled={true}

                                onMapReady={this._onMapReady}
                                onRegionChangeComplete={this._onRegionChanged}

                                customMapStyle={this.props.theme.dark ? darkStyles : undefined}

                                style={{
                                    flex: 1,
                                    backgroundColor: this.props.theme.colors.surface,
                                }}
                            >
                                {this.state.members.map((n) => (
                                    <MarkerAnimated
                                        key={n.member.member.id.toString()}
                                        identifier={n.member.member.id.toString()}
                                        coordinate={n.coordinates}
                                        tracksViewChanges={true}
                                        title={`${n.member.member.firstname} ${n.member.member.lastname}\n${n.member.member.club.name}, ${n.member.member.association.name}`}
                                        onCalloutPress={() => this.props.showProfile(n.member.member.id)}
                                    >
                                        <Pin
                                            color={this.props.theme.colors.accent}
                                            member={n.member.member}
                                        />
                                    </MarkerAnimated>
                                ))}
                            </MapView>

                            <FAB
                                style={styles.fab}
                                icon={({ size, color }) => <Ionicons style={{ paddingLeft: 1 }} size={size + 2} color={color} name="md-compass" />}
                                onPress={this._getLocationAsync}
                            />
                        </>
                    )}
                </View>
            </NearbyEnabled>
        );
    }
}

export const NearbyMapScreen = connect<StateProps, DispatchPros, OwnProps, IAppState>(
    (state) => ({
        location: state.location.location,
        members: state.location.nearbyMembers,
        nearbyMap: state.settings.nearbyMembersMap || false,
    }),
    {
        showProfile,
        showNearbySettings,
    },
)(
    withWhoopsErrorBoundary(
        withNavigation(
            withTheme(NearbyMapScreenBase),
        ),
    ),
);
