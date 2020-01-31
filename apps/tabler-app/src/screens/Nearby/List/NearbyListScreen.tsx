import * as Location from 'expo-location';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Divider, List, Text, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditScreenName } from '../../../analytics/AuditScreenName';
import { withWhoopsErrorBoundary } from '../../../components/ErrorBoundary';
import { Placeholder } from '../../../components/Placeholder/Placeholder';
import { TapOnNavigationParams } from '../../../components/ReloadNavigationOptions';
import { I18N } from '../../../i18n/translation';
import { NearbyMembers_nearbyMembers } from '../../../model/graphql/NearbyMembers';
import { IAppState } from '../../../model/IAppState';
import { showLocationHistory, showProfile } from '../../../redux/actions/navigation';
import { NearbyEnabled } from '../NearbyEnabled';
import { makeGroups } from './makeGroups';
import { MeLocation } from './MeLocation';
import { MemberListPlaceholder } from './MemberListPlaceholder';
import { NearbyMemberItem } from './NearbyMemberItem';

type State = {
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    location?: Location.LocationData,
    address?: Location.Address,
    members: NearbyMembers_nearbyMembers[],
};

type DispatchPros = {
    showProfile: typeof showProfile,
    showLocationHistory: typeof showLocationHistory;
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps<TapOnNavigationParams>;

class NearbyListScreenBase extends AuditedScreen<Props, State> {
    scrollView!: ScrollView | null;

    constructor(props) {
        super(props, AuditScreenName.NearbyMembersList);
    }

    componentDidMount() {
        super.componentDidMount();

        this.props.navigation.setParams({
            tapOnTabNavigator: () => {
                requestAnimationFrame(
                    () => this.scrollView?.scrollTo({
                        y: 0, x: 0, animated: true,
                    }),
                );
            },
        });
    }

    makeTitle(location, country) {
        if (this.props.address && I18N.Countries.translate(country) !== I18N.Countries.translate(this.props.address.country)) {
            return I18N.NearbyMembers.near(`${location}, ${I18N.Countries.translate(country)}`);
        }

        return I18N.NearbyMembers.near(location);
    }

    render() {
        return (
            <NearbyEnabled>
                <View style={{ flex: 1, backgroundColor: this.props.theme.colors.background }}>
                    <ScrollView ref={(r) => this.scrollView = r}>
                        <Placeholder previewComponent={<MemberListPlaceholder />} ready={this.props.members != null}>
                            <MeLocation now={Date.now()} />

                            {this.props.members.length === 0 && (
                                <List.Section title={I18N.NearbyMembers.title}>
                                    <Text style={{ marginHorizontal: 16 }}>{I18N.Members.noresults}</Text>
                                </List.Section>
                            )}

                            {this.props.members.length !== 0 &&
                                makeGroups(this.props.members).map((s, i) => (
                                    <List.Section title={this.makeTitle(s.title, s.country)} key={i.toString()}>
                                        {
                                            s.members.map((m) =>
                                                (
                                                    <React.Fragment key={m.member.id}>
                                                        <NearbyMemberItem member={m.member} lastseen={m.lastseen} distance={m.distance} />
                                                        <Divider inset={true} />
                                                    </React.Fragment>
                                                ),
                                            )
                                        }
                                    </List.Section>
                                ))
                            }
                        </Placeholder>
                    </ScrollView>
                </View>
            </NearbyEnabled>
        );
    }
}

export const NearbyListScreen = connect<StateProps, DispatchPros, OwnProps, IAppState>(
    (state) => ({
        location: state.location.location,
        address: state.location.address,
        members: state.location.nearbyMembers || [],
    }),
    {
        showProfile,
        showLocationHistory,
    },
)(
    withWhoopsErrorBoundary(
        withNavigation(
            withTheme(NearbyListScreenBase),
        ),
    ),
);
