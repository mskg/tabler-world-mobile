
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Query } from 'react-apollo';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Banner, Card, DataTable, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, ScrollView } from 'react-navigation';
import { FullScreenLoading } from '../components/Loading';
import { ScreenWithHeader } from '../components/Screen';
import { createApolloContext } from '../helper/createApolloContext';
import { OpenLink } from '../helper/OpenLink';
import { I18N } from '../i18n/translation';
import { Features, isFeatureEnabled } from '../model/Features';
import { GetLocationHistory } from '../model/graphql/GetLocationHistory';
import { GetLocationHistoryQuery } from '../queries/Location/GetLocationHistoryQuery';

type State = {
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
};

type DispatchPros = {
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps;

class LocationHistoryScreenBase extends React.Component<Props, State> {
    mapRef: MapView | null = null;

    _fitMap = () => {
        if (this.mapRef) {
            this.mapRef.fitToSuppliedMarkers(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
        }
    }

    render() {
        return (
            <ScreenWithHeader
                header={{
                    showBack: true,
                    title: 'Location History',
                }}
            >
                {isFeatureEnabled(Features.LocationHistory) && (
                    <Banner
                        visible={true}
                        actions={[]}
                        image={({ size }) =>
                            <Ionicons name="md-alert-circle" size={size} color={this.props.theme.colors.accent} />
                        }
                    >
                        This is only enabled during testing to allow you check and validate your location history.
                    </Banner>
                )}

                <Query<GetLocationHistory>
                    query={GetLocationHistoryQuery}
                    fetchPolicy="network-only"
                    context={createApolloContext('LocationHistory')}
                >
                    {({ data, error }) => {
                        if (error) return null;

                        if (data == null || data.LocationHistory == null) {
                            return (
                                <FullScreenLoading />
                            );
                        } else {
                            setTimeout(this._fitMap, 500);
                        }

                        return (
                            <ScrollView horizontal={true} contentContainerStyle={styles.content}>
                                <ScrollView nestedScrollEnabled={true}>
                                    <Card>
                                        <DataTable style={{ width: 650 }}>
                                            <DataTable.Header>
                                                <DataTable.Title style={{ width: 120, flex: 0 }}>Timestamp</DataTable.Title>
                                                <DataTable.Title>Location</DataTable.Title>

                                                <DataTable.Title style={{ width: 120, flex: 0 }} numeric={true}>Latitude</DataTable.Title>
                                                <DataTable.Title style={{ width: 120, flex: 0 }} numeric={true}>Longitude</DataTable.Title>
                                                <DataTable.Title style={{ width: 60, flex: 0 }} numeric={true}>Accuracy</DataTable.Title>
                                            </DataTable.Header>

                                            {data.LocationHistory.map((l, i) => (
                                                <DataTable.Row key={i.toString()}>
                                                    <DataTable.Cell style={{ width: 120, flex: 0 }}>{I18N.formatDate(l.lastseen, 'Date_Short_Time')}</DataTable.Cell>

                                                    <DataTable.Cell onPress={() => OpenLink.url(`https://maps.google.com/?q=${l.location?.latitude},${l.location?.longitude}`)}>
                                                        {l.locationName?.name},({l.locationName?.country})
                                                    </DataTable.Cell>

                                                    <DataTable.Cell style={{ width: 120, flex: 0 }} numeric={true}>{Math.round(l.location!.latitude * 1e6) / 1e6}</DataTable.Cell>
                                                    <DataTable.Cell style={{ width: 120, flex: 0 }} numeric={true}>{Math.round(l.location!.longitude * 1e6) / 1e6}</DataTable.Cell>
                                                    <DataTable.Cell style={{ width: 60, flex: 0 }} numeric={true}>{Math.round(l.accuracy)}m</DataTable.Cell>
                                                </DataTable.Row>))
                                            }
                                        </DataTable>
                                    </Card>

                                    <Card style={styles.mapCard}>
                                        <MapView
                                            ref={(ref) => { this.mapRef = ref; }}
                                            style={styles.map}
                                            zoomEnabled={true}
                                            scrollEnabled={true}
                                            onMapReady={this._fitMap}
                                        >
                                            {
                                                data.LocationHistory.map((l, i) => (
                                                    <Marker
                                                        key={i.toString()}
                                                        identifier={i.toString()}
                                                        title={I18N.formatDate(l.lastseen, 'Date_Short_Time')}
                                                        coordinate={l.location!}
                                                    />
                                                ))
                                            }
                                        </MapView>
                                    </Card>
                                </ScrollView>
                            </ScrollView>
                        );
                    }}
                </Query>
            </ScreenWithHeader>
        );
    }
}

// tslint:disable-next-line: export-name
export const LocationHistoryScreen = withTheme(LocationHistoryScreenBase);

const styles = StyleSheet.create({
    mapCard: {
        marginTop: 16,
        marginBottom: 100,
    },

    map: {
        height: 400,
    },

    container: {
        flex: 1,
    },

    content: {
        padding: 8,
    },

    first: {
        flex: 2,
    },
});
