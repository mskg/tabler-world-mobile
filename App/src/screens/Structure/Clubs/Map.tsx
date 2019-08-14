import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import React from 'react';
import { Query } from 'react-apollo';
import { Dimensions, Platform, View } from 'react-native';
import MapView, { Callout, LatLng, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Avatar, FAB, IconButton, Searchbar, Surface, Theme, Title, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditScreenName as ScreenName } from '../../../analytics/AuditScreenName';
import { withWhoopsErrorBoundary } from '../../../components/ErrorBoundary';
import { CachedImage } from '../../../components/Image/CachedImage';
import { FullScreenLoading } from '../../../components/Loading';
import { CannotLoadWhileOffline } from '../../../components/NoResults';
import { Placeholder } from '../../../components/Placeholder/Placeholder';
import { withCacheInvalidation } from '../../../helper/cache/withCacheInvalidation';
import { Categories, Logger } from "../../../helper/Logger";
import { I18N } from '../../../i18n/translation';
import { ClubsMap } from '../../../model/graphql/ClubsMap';
import { GetClubsMapQuery } from '../../../queries/GetClubsMapQuery';
import { homeScreen, showClub } from '../../../redux/actions/navigation';
import { styles } from '../Styles';
import { darkStyles } from './dark';
import { Routes } from './Routes';
import { Tab } from './Tab';

const logger = new Logger(Categories.Screens.Structure);
const maxWidth = Dimensions.get("window").width - 32 - 16;

type State = {
    location?: Location.LocationData,
    centerOn?: Region,
    marginBottom: number,
};

type Props = {
    theme: Theme,
    showClub: typeof showClub,

    loading: boolean,
    refresh: () => any,
    data?: ClubsMap | null,
} & NavigationInjectedProps;

class ClubsScreenBase extends AuditedScreen<Props, State> {
    constructor(props) {
        super(props, ScreenName.ClubMap);

        this.state = {
            marginBottom: 1
        };
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

    _showList = () => requestAnimationFrame(() => this.props.navigation.navigate(Routes.List))

    render() {
        return (
            <Placeholder
                ready={this.props.data != null && this.props.data.Clubs != null}
                previewComponent={<FullScreenLoading />}
            >
                <MapView
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

                    style={{
                        flex: 1,
                        backgroundColor: this.props.theme.colors.surface,
                    }}
                >
                    {this.props.data && this.props.data.Clubs &&
                        this.props.data.Clubs
                            .filter(f => f.location != null)
                            .map(c => (
                                <Marker
                                    key={c.id}
                                    coordinate={c.location as LatLng}
                                >
                                    <Callout
                                        tooltip
                                        style={{
                                            height: 190,
                                            flexDirection: "column",
                                            backgroundColor: this.props.theme.colors.surface,
                                            alignSelf: 'flex-start',
                                        }}
                                        onPress={() => this.props.showClub(c.id)}
                                    >
                                        <Title numberOfLines={1} style={{ paddingHorizontal: 8, maxWidth }}>{c.name}</Title>
                                        <View>
                                            <CachedImage
                                                preview={<Avatar.Text
                                                    style={{ backgroundColor: this.props.theme.colors.backdrop, }}
                                                    size={150}
                                                    label={c.club}
                                                />}
                                                style={{ width: 150, height: 150 }}
                                                uri={c.logo}
                                                cacheGroup="club"
                                                resizeMode="contain"
                                            />
                                        </View>
                                    </Callout>
                                </Marker>
                            ))
                    }
                </MapView>

                <View style={styles.search}>
                    <Searchbar
                        style={[styles.searchbar]}
                        selectionColor={this.props.theme.colors.accent}
                        placeholder={I18N.Search.search}
                        autoCorrect={false}

                    // value={this.state.search}
                    // onChangeText={this._search}
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
            </Placeholder>
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
