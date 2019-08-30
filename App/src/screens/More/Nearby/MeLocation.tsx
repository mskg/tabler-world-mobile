    import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React from 'react';
import { Query } from 'react-apollo';
import { IconButton, List, Theme, Title, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { InternalMeListItemBase } from '../../../components/MeListItem';
import { timespan } from '../../../helper/timespan';
import { I18N } from '../../../i18n/translation';
import { Features, isFeatureEnabled } from '../../../model/Features';
import { Me } from '../../../model/graphql/Me';
import { IAppState } from '../../../model/IAppState';
import { GetMeQuery } from '../../../queries/MeQuery';
import { showLocationHistory } from '../../../redux/actions/navigation';
import { handleLocationUpdate } from '../../../tasks/location/handleLocation';

type State = {
    message?: string,
    canSet?: boolean,
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    address?: Location.Address,
    timestamp?: number,
    now: number,
  };

type DispatchPros = {
    showLocationHistory: typeof showLocationHistory
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps;

class MeLocationBase extends React.Component<Props, State> {
    getLocation(): string {
        if (!this.props.address) { return I18N.NearbyMembers.near(); }
        return this.props.address.city || this.props.address.region || I18N.NearbyMembers.near();
    }

    _update = () => {
        requestAnimationFrame(async () =>
            await handleLocationUpdate([await Location.getCurrentPositionAsync()])
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
                        <List.Section title={I18N.NearbyMembers.location} key={"me"}>
                            <InternalMeListItemBase
                                theme={this.props.theme}
                                title={<Title>{medata.Me.firstname} {medata.Me.lastname}</Title>}
                                subtitle={this.getLocation() + ", " + I18N.NearbyMembers.ago(
                                    timespan(
                                        this.props.now,
                                        this.props.timestamp
                                    ))}
                                me={medata.Me}
                                onPress={isFeatureEnabled(Features.LocationHistory) ? () => this.props.showLocationHistory() : undefined}

                                right={({size}) =>
                                    <IconButton
                                        onPress={this._update}
                                        icon={() => (<Ionicons name="md-refresh" size={size} />)}
                                    />
                                }
                            />
                        </List.Section>
                    );
                }}
            </Query>
        );
    }
}

export const MeLocation = connect<StateProps, DispatchPros, OwnProps, IAppState>(
    (state) => ({
        address: state.location.address,
        timestamp: state.location.timestamp,
    }),
    {
        showLocationHistory
    })(withNavigation(withTheme(MeLocationBase)));


