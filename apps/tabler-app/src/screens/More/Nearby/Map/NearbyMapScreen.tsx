import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import _ from 'lodash';
import React from 'react';
import { View } from 'react-native';
import MapView, { LatLng, Marker, Region } from 'react-native-maps';
import { FAB, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../../../analytics/AuditedScreen';
import { AuditScreenName } from '../../../../analytics/AuditScreenName';
import { withWhoopsErrorBoundary } from '../../../../components/ErrorBoundary';
import { I18N } from '../../../../i18n/translation';
import { NearbyMembers_nearbyMembers } from '../../../../model/graphql/NearbyMembers';
import { IAppState } from '../../../../model/IAppState';
import { showNearbySettings, showProfile } from '../../../../redux/actions/navigation';
import { darkStyles } from '../../../Structure/Clubs/darkStyles';
import { styles } from '../../../Structure/Styles';
import { Message } from '../Message';
import { NearbyEnabled } from '../NearbyEnabled';
import { Pin } from './Pin';

type State = {
    location?: Location.LocationData,
    centerOn?: Region,
    marginBottom: number,
    regionChanged: boolean,
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    location?: Location.LocationData,
    address?: Location.Address,
    members?: NearbyMembers_nearbyMembers[],
    nearbyMap: boolean,
};

type DispatchPros = {
    showProfile: typeof showProfile,
    showNearbySettings: typeof showNearbySettings,
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps<unknown>;

class NearbyMapScreenBase extends AuditedScreen<Props, State> {
    mapRef: MapView | null = null;

    constructor(props) {
        super(props, AuditScreenName.NearbyMembersMap);

        this.state = {
            marginBottom: 1,
            regionChanged: false,
        };
    }

    componentDidMount() {
        if (this.props.nearbyMap) {
            this._getLocationAsync();
        }

        this.audit.submit();
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

    componentDidUpdate(prevProps: Props) {
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
                            text={I18N.NearbyMembers.mapOff}
                            button={I18N.NearbyMembers.on}
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
                                {(this.props.members || []).filter((f) => f.canshowonmap).map((n) => (
                                    <Marker
                                        key={n.member.id.toString()}
                                        identifier={n.member.id.toString()}
                                        coordinate={n.address.location as LatLng}
                                        tracksViewChanges={false}
                                        title={`${n.member.firstname} ${n.member.lastname}\n${n.member.club.name}, ${n.member.association.name}`}
                                        onCalloutPress={() => this.props.showProfile(n.member.id)}
                                    >
                                        <Pin
                                            color={this.props.theme.colors.accent}
                                            member={n.member}
                                        />
                                    </Marker>
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
        address: state.location.address,
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
