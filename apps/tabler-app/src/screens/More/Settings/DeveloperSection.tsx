import Constants from 'expo-constants';
import React from 'react';
import { AsyncStorage, Clipboard } from 'react-native';
import { Divider, List, Theme, withTheme } from 'react-native-paper';
import { cachedAolloClient } from '../../../apollo/bootstrapApollo';
import { Categories, Logger } from '../../../helper/Logger';
import { getParameterValue } from '../../../helper/parameters/getParameterValue';
import { enableConsole, PRESERVE_CONSOLE } from '../../../helper/PRESERVE_CONSOLE';
import { I18N } from '../../../i18n/translation';
import { GetMyRoles } from '../../../model/graphql/GetMyRoles';
import { ParameterName, UserRole } from '../../../model/graphql/globalTypes';
import { GetMyRolesQuery } from '../../../queries/Admin/GetMyRolesQuery';
import { FETCH_LAST_DATA_RUN, FETCH_LAST_RUN, TOKEN_KEY } from '../../../tasks/Constants';
import { runFetchTask } from '../../../tasks/fetch/runFetchTask';
import { Action } from './Action';
import { Element } from './Element';

const logger = new Logger(Categories.Screens.Setting);

type State = {
    token?: string | null,

    lastFetchRun: Date | null,
    lastDataRun: Date | null,

    isDeveloper: boolean,
    params?: string | null,
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
};

type DispatchPros = {
};

type Props = OwnProps & StateProps & DispatchPros;

function formatDate(nbr: string | null) {
    if (!nbr) return null;
    return new Date(parseInt(nbr || '0', 10));
}

class DeveloperSectionBase extends React.Component<Props, State> {
    state: State = {
        isDeveloper: false,

        lastDataRun: null,
        lastFetchRun: null,
    };

    async fetchData() {
        const params = {};

        Promise.all(Object.keys(ParameterName).map(async (k) => {
            params[ParameterName[k]] = await getParameterValue(k as ParameterName);
        }));

        this.setState({
            token: await AsyncStorage.getItem(TOKEN_KEY),
            lastFetchRun: formatDate(await AsyncStorage.getItem(FETCH_LAST_RUN)),
            lastDataRun: formatDate(await AsyncStorage.getItem(FETCH_LAST_DATA_RUN)),
            params: JSON.stringify(params),
        });

    }

    async componentDidMount() {
        try {
            const client = cachedAolloClient();
            const roles = await client.query<GetMyRoles>({
                query: GetMyRolesQuery,
                fetchPolicy: 'cache-first',
            });

            if (roles.data && roles.data.MyRoles && roles.data.MyRoles.find((i) => i === UserRole.developer)) {
                this.setState({ isDeveloper: true });
            }
        } catch { }

        await this.fetchData();
    }

    render() {
        return (
            <>
                {this.state.isDeveloper && (
                    <List.Section title={'Development'}>
                        <Element
                            theme={this.props.theme}
                            field={'Push Token'}
                            text={(this.state.token || '-').replace('ExponentPushToken[', '').replace(']', '')}
                        />
                        <Divider />

                        <Element
                            theme={this.props.theme}
                            field={'Device ID'}
                            text={Constants.deviceId}
                        />
                        <Divider />

                        <Element
                            theme={this.props.theme}
                            field={'Lasts Fetch Run'}
                            text={I18N.Settings.sync.date(this.state.lastFetchRun)}
                        />
                        <Divider />

                        <Element
                            theme={this.props.theme}
                            field={'Last Data Sync'}
                            text={I18N.Settings.sync.date(this.state.lastDataRun)}
                        />
                        <Divider />

                        <Action theme={this.props.theme} text={'Run Fetch Task'} onPress={async () => { await runFetchTask(); await this.fetchData(); }} />
                        <Divider />

                        {false && PRESERVE_CONSOLE && (
                            <>
                                <Element
                                    theme={this.props.theme}
                                    field={'Console Log'}
                                    text={PRESERVE_CONSOLE.toString()}
                                />
                                <Divider />
                            </>
                        )}

                        {false && !PRESERVE_CONSOLE && (
                            <>
                                <Action theme={this.props.theme} text={'Enable Console Log'} onPress={() => enableConsole()} />
                                <Divider />
                            </>
                        )}

                        <Action theme={this.props.theme} text={'Copy Parameters'} onPress={() => Clipboard.setString(this.state.params || 'null')} />
                        <Divider />

                    </List.Section>
                )}
            </>
        );
    }
}

export const DeveloperSection = withTheme(DeveloperSectionBase);
