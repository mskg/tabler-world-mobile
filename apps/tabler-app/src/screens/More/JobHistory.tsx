import React from 'react';
import { Query } from 'react-apollo';
import { StyleSheet, TouchableWithoutFeedback, Alert } from 'react-native';
import { Card, DataTable, Theme } from 'react-native-paper';
import { NavigationInjectedProps, ScrollView } from 'react-navigation';
import { FullScreenLoading } from '../../components/Loading';
import { ScreenWithHeader } from '../../components/Screen';
import { createApolloContext } from '../../helper/createApolloContext';
import { formatFullTimespan } from '../../helper/formatting/formatTimespan';
import { formatDate } from '../../i18n/formatDate';
import { I18N } from '../../i18n/translation';
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
            return `Count: ${I18N.formatNumber(data.recipients || 0)}, Errors: ${I18N.formatNumber(data.errors || 0)}`;
        }

        if (data.__typename === 'JobSync') {
            const values = [
                { key: 'Count', value: data.records ? I18N.formatNumber(data.records) : undefined },
                { key: 'Modified', value: I18N.formatNumber(data.modified || 0) },
                { key: 'Read', value: data.readTime ? formatFullTimespan(data.readTime) : undefined },
                { key: 'Refresh', value: data.refreshTime ? formatFullTimespan(data.refreshTime) : undefined },
            ];

            return values.filter((v) => v.value != null).map((v) => `${v.key}: ${v.value}`).join('; ');
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
                    context={createApolloContext('JobHistoryScreen')}
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
                                                <DataTable.Title style={{ width: 120, flex: 0 }}>Timestamp</DataTable.Title>
                                                <DataTable.Title style={{ width: 240, flex: 0 }}>Name</DataTable.Title>
                                                <DataTable.Title style={{ width: 80, flex: 0 }}>Status</DataTable.Title>

                                                <DataTable.Title>Data</DataTable.Title>
                                            </DataTable.Header>

                                            {data.Jobs.map((l, i) => (
                                                <DataTable.Row key={i.toString()}>
                                                    <DataTable.Cell style={{ width: 120, flex: 0 }}>{formatDate(new Date(l.runon), 'Date_Short_Time')}</DataTable.Cell>
                                                    <DataTable.Cell style={{ width: 240, flex: 0 }}>{l.name}</DataTable.Cell>
                                                    <DataTable.Cell style={{ width: 80, flex: 0 }}>{l.status}</DataTable.Cell>

                                                    <DataTable.Cell onPress={() => Alert.alert('Message', this.formatData(l.data) || '')}>
                                                        {this.formatData(l.data)}
                                                    </DataTable.Cell>
                                                </DataTable.Row>
                                            ))}
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
