import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Query } from 'react-apollo';
import { StyleSheet } from 'react-native';
import { Banner, Card, DataTable, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, ScrollView } from 'react-navigation';
import { InlineLoading } from '../../components/Loading';
import { ScreenWithHeader } from '../../components/Screen';
import { OpenLink } from '../../helper/OpenLink';
import { GetLocationHistory } from '../../model/graphql/GetLocationHistory';
import { GetLocationHistoryQuery } from '../../queries/GetLocationHistory';

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
            <ScreenWithHeader header={{
                showBack: true,
                title: "Location History"
            }}>
                <Banner
                    visible={true}
                    actions={[]}
                    image={({ size }) =>
                        <Ionicons name="md-alert" size={size} color={this.props.theme.colors.accent} />
                    }
                >
                    This is only enabled during testing to allow you check and validate your location history.
                </Banner>

                <Query<GetLocationHistory>
                    query={GetLocationHistoryQuery}
                    fetchPolicy="network-only"
                >
                    {({ loading, data, error, refetch, client }) => {
                        if (error) return null;

                        if (data == null || data.LocationHistory == null) {
                            return (
                                <InlineLoading />
                            );
                        }

                        return (
                            <ScrollView horizontal={true} contentContainerStyle={styles.content}>
                                <ScrollView nestedScrollEnabled>
                                    <Card>
                                        <DataTable style={{ width: 900 }}>
                                            <DataTable.Header>
                                                <DataTable.Title style={{ width: 160, flex: 0 }}>Timestamp</DataTable.Title>
                                                <DataTable.Title>Location</DataTable.Title>

                                                <DataTable.Title style={{ width: 120, flex: 0 }} numeric>Latitude</DataTable.Title>
                                                <DataTable.Title style={{ width: 120, flex: 0 }} numeric>Longitude</DataTable.Title>
                                                <DataTable.Title style={{ width: 60, flex: 0 }} numeric>Accuracy</DataTable.Title>
                                            </DataTable.Header>

                                            {data.LocationHistory.map((l, i) => (
                                                <DataTable.Row key={i.toString()}>
                                                    <DataTable.Cell style={{ width: 160, flex: 0 }}>{new Date(l.lastseen).toLocaleString()}</DataTable.Cell>
                                                    <DataTable.Cell onPress={() => OpenLink.url(`https://maps.google.com/?q=${l.latitude},${l.longitude}`)}>{l.street}, {l.city} ({l.country})</DataTable.Cell>

                                                    <DataTable.Cell style={{ width: 120, flex: 0 }} numeric>{l.latitude}</DataTable.Cell>
                                                    <DataTable.Cell style={{ width: 120, flex: 0 }} numeric>{l.longitude}</DataTable.Cell>
                                                    <DataTable.Cell style={{ width: 60, flex: 0 }} numeric>{Math.round(l.accuracy)}m</DataTable.Cell>
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