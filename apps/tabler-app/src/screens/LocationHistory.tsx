import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Query } from 'react-apollo';
import { StyleSheet } from 'react-native';
import { Banner, Card, DataTable, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, ScrollView } from 'react-navigation';
import { FullScreenLoading } from '../components/Loading';
import { ScreenWithHeader } from '../components/Screen';
import { OpenLink } from '../helper/OpenLink';
import { GetLocationHistory } from '../model/graphql/GetLocationHistory';
import { GetLocationHistoryQuery } from '../queries/Location/GetLocationHistoryQuery';
import { isFeatureEnabled, Features } from '../model/Features';
import { createApolloContext } from '../helper/createApolloContext';
import { I18N } from '../i18n/translation';

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
                            <Ionicons name="md-alert" size={size} color={this.props.theme.colors.accent} />
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
