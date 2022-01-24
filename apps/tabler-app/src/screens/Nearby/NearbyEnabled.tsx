import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IAppState } from '../../model/IAppState';

type State = {
};

type OwnProps = {
};

type StateProps = {
    nearbyMembersEnabled?: boolean,
    isOffline: boolean,
    currentLocation?: LocationObject,
};

type Props = OwnProps & StateProps;

class NearbyEnabledBase extends PureComponent<Props, State> {
    render() {
        if (
            this.props.nearbyMembersEnabled
            && !this.props.isOffline
            && this.props.currentLocation) {
            return this.props.children;
        }

        return null;
    }
}

export const NearbyEnabled = connect(
    (state: IAppState) => ({
        nearbyMembersEnabled: state.settings.nearbyMembers,
        isOffline: state.connection.offline,
        currentLocation: state.location.location,
    }),
)(
    NearbyEnabledBase,
);
