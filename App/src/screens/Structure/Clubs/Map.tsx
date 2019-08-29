import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import _ from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { Platform, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { FAB, IconButton, Searchbar, Surface, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditScreenName as ScreenName } from '../../../analytics/AuditScreenName';
import { withWhoopsErrorBoundary } from '../../../components/ErrorBoundary';
import { FullScreenLoading } from '../../../components/Loading';
import { CannotLoadWhileOffline } from '../../../components/NoResults';
import { withCacheInvalidation } from '../../../helper/cache/withCacheInvalidation';
import { Categories, Logger } from "../../../helper/Logger";
import { normalizeForSearch } from '../../../helper/normalizeForSearch';
import { I18N } from '../../../i18n/translation';
import { ClubsMap, ClubsMap_Clubs } from '../../../model/graphql/ClubsMap';
import { GetClubsMapQuery } from '../../../queries/GetClubsMapQuery';
import { homeScreen, showClub } from '../../../redux/actions/navigation';
import { styles } from '../Styles';
import { darkStyles } from './dark';
import { ClubMarker } from './Marker';
import { Routes } from './Routes';
import { Tab } from './Tab';

const logger = new Logger(Categories.Screens.Structure);

type State = {
    location?: Location.LocationData,
    centerOn?: Region,
    marginBottom: number,

    search: string,
    filtered: ClubsMap_Clubs[],
};

type Props = {
    theme: Theme,
    showClub: typeof showClub,

    loading: boolean,
    refresh: () => any,
    data?: ClubsMap | null,
} & NavigationInjectedProps;

class ClubsScreenBase extends AuditedScreen<Props, State> {
    mapRef: MapView | null = null;

    constructor(props) {
        super(props, ScreenName.ClubMap);

        this.state = {
            marginBottom: 1,
            search: "",
            filtered: this.filterData(props.data),
        };
    }

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.data !== this.props.data) {
            // logger.debug("Received", JSON.stringify(nextProps.data));

            this.setState({
                search: this.state.search,
                filtered: this.filterData(nextProps.data, this.state.search)
            });
        }
    }

    _getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        this.setState({
            location,
            centerOn: {
                longitude: location.coords.longitude,
                latitude: location.coords.latitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }
        });
    };

    _onMapReady = () => this.setState({ marginBottom: 0 })

    componentWillMount() {
        if (Platform.OS === 'android' && !Constants.isDevice) {
            // canot get location
        } else {
            this._getLocationAsync();
        }
    }

    _normalizedSearch = (search: string) => (target: string) => {
        const segments = normalizeForSearch(search).split(' ');
        const changedTarget = normalizeForSearch(target);

        let found = false;
        for (const search of segments) {
            if (changedTarget.indexOf(search) < 0) {
                return false;
            }

            found = true;
        }

        return found;
    }

    makeSearchTexts(c: ClubsMap_Clubs): string[] {
        return [
            c.name,
        ].filter(Boolean);
    }

    filterData(data?: ClubsMap | null, text?: string): ClubsMap_Clubs[] {
        if (data == null) { return []; }

        //@ts-ignore
        return _(data.Clubs)
            .filter(d => d.location != null)
            .map((item: ClubsMap_Clubs) => {
                var match = _.find(
                    this.makeSearchTexts(item),
                    this._normalizedSearch(text || ""));

                return match ? {
                    ...item,
                    match,
                } : null;
            })
            .filter(r => r != null)
            .toArray()
            .value();
    }

    _showList = () => requestAnimationFrame(() => this.props.navigation.navigate(Routes.List));

    _fitMap = _.debounce(() => {
        if (this.mapRef) {
            if (this.state.search === "") {
                this._getLocationAsync();
            } else {
                this.mapRef.fitToSuppliedMarkers(
                    this.state.filtered.map(d => d.id)
                );
            }
        };
    }, 1000);

    // _fitCluster = (_coordinates,markers) => {
    //     if (this.mapRef) {
    //         this.mapRef.fitToSuppliedMarkers(
    //             markers
    //         );
    //     };
    // };

    _search = (text) => {
        this.setState({
            search: text,
            filtered: this.filterData(this.props.data, text),
            centerOn: undefined,
        }, this._fitMap);
    }

    render() {
        if (this.props.data == null || this.props.data.Clubs == null) {
            return <FullScreenLoading />;
        }

        return (
            <>
                <MapView
                    ref={(ref) => { this.mapRef = ref; }}

                    provider={this.props.theme.dark ? PROVIDER_GOOGLE : undefined}
                    zoomEnabled={true}
                    scrollEnabled={true}
                    region={this.state.centerOn}

                    showsUserLocation={true}

                    showsMyLocationButton={false}
                    showsCompass={false}

                    loadingEnabled={true}
                    onMapReady={this._onMapReady}
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
                    {this.state.filtered.map(c => (<ClubMarker key={c.id.toString()} club={c} />))}
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
                            icon={({ size, color }) =>
                                <Ionicons
                                    name="md-list"
                                    size={size}
                                    color={color}
                                />}
                            onPress={this._showList}
                        />
                    </Surface>
                </View>

                <FAB
                    style={styles.fab}
                    icon={({ size, color }) => <Ionicons size={size + 2} color={color} name="md-compass" />}
                    onPress={this._getLocationAsync}
                />
            </>
        );
    }
}

const ConnectedClubScreen = connect(null, {
    showClub,
    homeScreen,
})(withTheme(withNavigation(ClubsScreenBase)));

const ClubsScreenWithQuery = ({ fetchPolicy }) => (
    <Tab>
        <Query<ClubsMap> query={GetClubsMapQuery} fetchPolicy={fetchPolicy}>
            {({ loading, data, error, refetch }) => {
                if (error) throw error;

                if (!loading && (data == null || data.Clubs == null)) {
                    return <CannotLoadWhileOffline />;
                }

                return (<ConnectedClubScreen loading={loading} data={data} refresh={refetch} />);
            }}
        </Query>
    </Tab>
);

export const ClubsMapScreen = withWhoopsErrorBoundary(
    withCacheInvalidation("clubs", ClubsScreenWithQuery));
