import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import _ from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { Platform, View } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { FAB, IconButton, Searchbar, Surface, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditPropertyNames } from '../../../analytics/AuditPropertyNames';
import { AuditScreenName as ScreenName } from '../../../analytics/AuditScreenName';
import { withWhoopsErrorBoundary } from '../../../components/ErrorBoundary';
import { FullScreenLoading } from '../../../components/Loading';
import { CannotLoadWhileOffline } from '../../../components/NoResults';
import { TapOnNavigationParams } from '../../../components/ReloadNavigationOptions';
import { filterData } from '../../../helper/filterData';
import { I18N } from '../../../i18n/translation';
import { ClubsMap, ClubsMapVariables, ClubsMap_Clubs } from '../../../model/graphql/ClubsMap';
import { IAppState } from '../../../model/IAppState';
import { GetClubsMapQuery } from '../../../queries/Structure/GetClubsMapQuery';
import { homeScreen, showClub } from '../../../redux/actions/navigation';
import { styles } from '../Styles';
import { darkStyles } from './darkStyles';
import { ClubMarker } from './Marker';
import { Routes } from './Routes';
import { Tab } from './Tab';
import { withCacheInvalidation } from '../../../helper/cache/withCacheInvalidation';
import { RefreshTracker } from '../../../components/RefreshTracker';

type State = {
    location?: Location.LocationData,
    centerOn?: Region,
    marginBottom: number,

    search: string,
    filtered: ClubsMap_Clubs[],
    regionChanged: boolean,
};

type Props = {
    offline: boolean,
    association?: string,
    theme: Theme,
    showClub: typeof showClub,

    loading: boolean,
    refresh: () => any,
    data: ClubsMap_Clubs[] | null,
} & NavigationInjectedProps<TapOnNavigationParams>;

class ClubsScreenBase extends AuditedScreen<Props, State> {
    mapRef: MapView | null = null;

    constructor(props) {
        super(props, ScreenName.ClubMap);

        this.state = {
            marginBottom: 1,
            search: '',
            regionChanged: false,
            filtered: this.filterResults(props.data),
        };
    }

    componentDidMount() {
        // if (Platform.OS === 'android' && !Constants.isDevice) {
        //     // canot get location
        // } else {
        //     this._getLocationAsync();
        // }

        this.props.navigation.setParams({
            tapOnTabNavigator: () => {
                requestAnimationFrame(
                    () => this._getLocationAsync(),
                );

                if (this.props.data == null || this.props.data.length === 0) {
                    this.props.refresh();
                }
            },
        });

        this.audit.submit({
            [AuditPropertyNames.Association]: this.props.association,
        });
    }


    componentDidUpdate(prevProps: Props) {
        if (prevProps.data !== this.props.data) {
            // logger.debug("Received", JSON.stringify(nextProps.data));

            this.setState(
                {
                    search: this.state.search,
                    filtered: this.filterResults(this.props.data, this.state.search),
                },
                this._fitMap,
            );
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
    }

    _onMapReady = () => this.setState({ marginBottom: 0 });
    _onRegionChanged = () => {
        if (!this.state.regionChanged) {
            this.setState({ regionChanged: true });
        }
    }

    _makeSearchTexts = (c: ClubsMap_Clubs): string[] => {
        return [
            c.name,
        ].filter(Boolean);
    }

    _filterSearch = (c: ClubsMap_Clubs) => c.location != null && c.location.latitude != null;

    _showList = () => requestAnimationFrame(() => this.props.navigation.navigate(Routes.List));

    _fitMap = _.debounce(
        () => {
            if (this.mapRef) {
                if (this.state.filtered != null && this.state.filtered.length > 0) {
                    this.mapRef.fitToSuppliedMarkers(
                        this.state.filtered.map((d) => d.id),
                    );
                }
            }
        },
        1000,
    );

    // _fitCluster = (_coordinates,markers) => {
    //     if (this.mapRef) {
    //         this.mapRef.fitToSuppliedMarkers(
    //             markers
    //         );
    //     };
    // };

    filterResults(data: ClubsMap_Clubs[] | null, text?: string) {
        return filterData(
            this._makeSearchTexts,
            data,
            text,
            this._filterSearch,
        );
    }

    _search = (text) => {
        this.setState(
            {
                search: text,
                filtered: this.filterResults(this.props.data, text),
                centerOn: undefined,
            },
            this._fitMap,
        );
    }

    render() {
        return (
            <>
                <MapView
                    ref={(ref) => { this.mapRef = ref; }}

                    // provider={this.props.theme.dark ? PROVIDER_GOOGLE : undefined}
                    zoomEnabled={true}
                    scrollEnabled={true}
                    region={this.state.centerOn}

                    showsUserLocation={true}

                    showsMyLocationButton={false}
                    showsCompass={false}

                    loadingEnabled={true}

                    onMapReady={this._onMapReady}
                    onRegionChangeComplete={this._onRegionChanged}

                    customMapStyle={this.props.theme.dark ? darkStyles : undefined}

                    // clusterColor={this.props.theme.colors.accent}
                    // clusterTextColor={this.props.theme.colors.text}
                    // clusterBorderWidth={0}
                    // onClusterPress={this._fitCluster}

                    style={{
                        flex: 1,
                        backgroundColor: this.props.theme.colors.surface,
                    }}
                >
                    {this.state.regionChanged && // we wait for the map to load
                        this.state.filtered.map((c) => (<ClubMarker key={c.id.toString()} club={c} />))
                    }
                </MapView>

                <View style={styles.search}>
                    <Searchbar
                        style={[styles.searchbar]}
                        selectionColor={this.props.theme.colors.accent}
                        placeholder={I18N.Search.search}
                        autoCorrect={false}

                        value={this.state.search}
                        onChangeText={this._search}
                    />

                    <Surface style={styles.switchLayoutButton}>
                        <IconButton
                            icon={
                                ({ size, color }) => (
                                    <Ionicons
                                        name="md-list"
                                        size={size}
                                        color={color}
                                    />
                                )
                            }
                            onPress={this._showList}
                        />
                    </Surface>
                </View>

                <FAB
                    style={styles.fab2}
                    icon={({ size, color }) => <Ionicons style={{ paddingLeft: 3 }} size={size + 2} color={color} name="md-refresh" />}
                    onPress={() => this.props.refresh()}
                />

                <FAB
                    style={styles.fab}
                    icon={({ size, color }) => <Ionicons style={{ paddingLeft: 1 }} size={size + 2} color={color} name="md-compass" />}
                    onPress={this._getLocationAsync}
                />

                {this.props.loading && <FullScreenLoading />}
            </>
        );
    }
}

const ConnectedClubScreen = connect(null, {
    showClub,
    homeScreen,
})(withTheme(withNavigation(ClubsScreenBase)));

const ClubsScreenWithQuery = ({ fetchPolicy, screenProps, offline }) => (
    <Tab>
        <RefreshTracker>
            {({ isRefreshing, createRunRefresh }) => {
                return (
                    <Query<ClubsMap, ClubsMapVariables>
                        query={GetClubsMapQuery}
                        fetchPolicy={fetchPolicy}
                        variables={{
                            association: screenProps?.association,
                        }}
                    >
                        {({ loading, data, error, refetch }) => {
                            if (error) throw error;

                            if (!loading && (data == null || data.Clubs == null)) {
                                if (offline) {
                                    return <CannotLoadWhileOffline />;
                                }

                                setTimeout(createRunRefresh(refetch));
                            }

                            return (
                                <ConnectedClubScreen
                                    offline={offline}
                                    loading={loading || isRefreshing}
                                    data={data && data.Clubs ? data.Clubs.filter((c) => c.location != null) : null}
                                    refresh={createRunRefresh(refetch)}
                                    association={screenProps?.association}
                                />
                            );
                        }}
                    </Query>
                );
            }}
        </RefreshTracker>
    </Tab>
);

export const ClubsMapScreen = withWhoopsErrorBoundary(
    withCacheInvalidation(
        'clubs',
        connect(
            (s: IAppState) => ({
                offline: s.connection.offline,
            }),
        )(ClubsScreenWithQuery),
    ),
);
