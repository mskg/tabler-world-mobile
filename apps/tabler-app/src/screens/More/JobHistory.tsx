import React from 'react';
import { Query } from 'react-apollo';
import { StyleSheet } from 'react-native';
import { Card, DataTable, Theme } from 'react-native-paper';
import { NavigationInjectedProps, ScrollView } from 'react-navigation';
import { FullScreenLoading } from '../../components/Loading';
import { ScreenWithHeader } from '../../components/Screen';
import { timespan } from '../../helper/timespan';
import { GetJobs, GetJobs_Jobs_data } from '../../model/graphql/GetJobs';
import { GetJobsQuery } from '../../queries/Admin/GetJobs';

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

// tslint:disable-next-line: export-name
export class JobsHistoryScreen extends React.Component<Props, State> {
    formatData(data: GetJobs_Jobs_data | null) {
        if (data == null) return null;

        if (data.__typename === 'JobError') {
            return JSON.stringify(data.error);
        }

        if (data.__typename === 'JobSend') {
            return `Count: ${data.recipients}, Errors: ${data.errors}`;
        }

        if (data.__typename === 'JobSync') {
            return `Count: ${data.records}, Modified: ${data.modified}, Duration: ${data.readTime ? timespan(data.readTime * 1000) : 'unknown'}`;
        }

        return null;
    }

    render() {
        return (
            <ScreenWithHeader
                header={{
                    showBack: true,
                    title: 'Job History',
                }}
            >
                <Query<GetJobs>
                    query={GetJobsQuery}
                    fetchPolicy="network-only"
                >
                    {({ data, error }) => {
                        if (error) return null;

                        if (data == null || data.Jobs == null) {
                            return (
                                <FullScreenLoading />
                            );
                        }

                        return (
                            <ScrollView horizontal={true} contentContainerStyle={styles.content}>
                                <ScrollView nestedScrollEnabled={true}>
                                    <Card>
                                        <DataTable style={{ width: 900 }}>
                                            <DataTable.Header>
                                                <DataTable.Title style={{ width: 160, flex: 0 }}>Timestamp</DataTable.Title>
                                                <DataTable.Title style={{ width: 240, flex: 0 }}>Name</DataTable.Title>
                                                <DataTable.Title style={{ width: 60, flex: 0 }}>Status</DataTable.Title>

                                                <DataTable.Title>Data</DataTable.Title>
                                            </DataTable.Header>

                                            {data.Jobs.map((l, i) => (
                                                <DataTable.Row key={i.toString()}>
                                                    <DataTable.Cell style={{ width: 160, flex: 0 }}>{new Date(l.runon).toLocaleString()}</DataTable.Cell>
                                                    <DataTable.Cell style={{ width: 240, flex: 0 }}>{l.name}</DataTable.Cell>
                                                    <DataTable.Cell style={{ width: 60, flex: 0 }}>{l.status}</DataTable.Cell>

                                                    <DataTable.Cell>{this.formatData(l.data)}</DataTable.Cell>
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
