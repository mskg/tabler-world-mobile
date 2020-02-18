import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React from 'react';
import { Query } from 'react-apollo';
import { IconButton, List, Theme, Title, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { cachedAolloClient } from '../../../apollo/bootstrapApollo';
import { InternalMeListItemBase } from '../../../components/MeListItem';
import { formatTimespan } from '../../../helper/formatting/formatTimespan';
import { I18N } from '../../../i18n/translation';
import { Features, isFeatureEnabled } from '../../../model/Features';
import { GeoCityLocation } from '../../../model/GeoCityLocation';
import { GetMyRoles } from '../../../model/graphql/GetMyRoles';
import { UserRole } from '../../../model/graphql/globalTypes';
import { Me } from '../../../model/graphql/Me';
import { IAppState } from '../../../model/IAppState';
import { GetMyRolesQuery } from '../../../queries/Admin/GetMyRolesQuery';
import { GetMeQuery } from '../../../queries/Member/GetMeQuery';
import { showLocationHistory } from '../../../redux/actions/navigation';
import { handleLocationUpdate } from '../../../tasks/location/handleLocationUpdate';

type State = {
    message?: string,
    canSet?: boolean,
    history?: boolean,
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    address?: GeoCityLocation,
    timestamp?: number,
    now: number,
};

type DispatchPros = {
    showLocationHistory: typeof showLocationHistory,
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps;

class MeLocationBase extends React.Component<Props, State> {
    async componentDidMount() {
        try {
            const client = cachedAolloClient();
            const roles = await client.query<GetMyRoles>({
                query: GetMyRolesQuery,
                fetchPolicy: 'cache-first',
            });

            if (roles.data && roles.data.MyRoles && roles.data.MyRoles.find((i) => i === UserRole.locationhistory)) {
                this.setState({ history: true });
            }
        } catch { }
    }

    getLocation(): string {
        if (!this.props.address) { return I18N.Screen_NearbyMembers.unknown; }
        return this.props.address.name || this.props.address.country || I18N.Screen_NearbyMembers.unknown;
    }

    _update = () => {
        requestAnimationFrame(async () =>
            await handleLocationUpdate([await Location.getCurrentPositionAsync()]),
        );
    }

    render() {
        return (
            <Query<Me>
                query={GetMeQuery}
            >
                {({ data: medata, error }) => {
                    if (error || medata == null || medata.Me == null) return null;
                    return (
                        <List.Section title={I18N.Screen_NearbyMembers.location} key={'me'}>
                            <InternalMeListItemBase
                                theme={this.props.theme}
                                title={<Title>{medata.Me.firstname} {medata.Me.lastname}</Title>}
                                subtitle={
                                    // tslint:disable-next-line: prefer-template
                                    this.getLocation()
                                    + ', '
                                    + I18N.format(
                                        I18N.Screen_NearbyMembers.ago,
                                        {
                                            timespan: formatTimespan(
                                                this.props.now,
                                                this.props.timestamp,
                                            ),
                                        },
                                    )
                                }
                                me={medata.Me}
                                onPress={isFeatureEnabled(Features.LocationHistory) || this.state.history ? () => this.props.showLocationHistory() : undefined}

                                right={({ size }) => (
                                    <IconButton
                                        onPress={this._update}
                                        icon={() => (<Ionicons name="md-refresh" size={size} />)}
                                    />
                                )}
                            />
                        </List.Section>
                    );
                }}
            </Query>
        );
    }
}

export const MeLocation = connect(
    (state: IAppState) => ({
        address: state.location.address,
        timestamp: state.location.timestamp,
    }),
    {
        showLocationHistory,
    },
)(
    withNavigation(withTheme(
        MeLocationBase)));


