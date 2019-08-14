import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import React from 'react';
import { Query } from 'react-apollo';
import { AppState, Linking, Platform, ScrollView, View } from "react-native";
import { Appbar, Divider, List, Text, Theme, withTheme } from 'react-native-paper';
import { NavigationEventSubscription, NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditScreenName } from '../../../analytics/AuditScreenName';
import { InlineLoading } from '../../../components/Loading';
import { InternalMemberListItem } from '../../../components/Member/InternalMemberListItem';
import { MemberTitle } from '../../../components/Member/MemberTitle';
import { CannotLoadWhileOffline } from '../../../components/NoResults';
import { ScreenWithHeader } from '../../../components/Screen';
import { distance } from '../../../helper/distance';
import { Categories, Logger } from '../../../helper/Logger';
import { timespan } from '../../../helper/timespan';
import { I18N } from '../../../i18n/translation';
import { NearbyMembers, NearbyMembersVariables } from '../../../model/graphql/NearbyMembers';
import { IAppState } from '../../../model/IAppState';
import { GetNearbyMembersQuery } from '../../../queries/GetNearbyMembers';
import { showProfile, showSettings } from '../../../redux/actions/navigation';
import { updateSetting } from '../../../redux/actions/settings';
import { makeGroups } from './makeGroups';
import { MeLocation } from './MeLocation';
import { Message } from './Message';

const logger = new Logger(Categories.Screens.Menu);
const POLL_INTERVAL = 10 * 1000;

type State = {
    message?: string,
    canSet?: boolean,
    visible: boolean,
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    location?: Location.LocationData,
    address?: Location.Address,
    timestamp?: number,
    nearbyMembers?: boolean,
    offline: boolean,
};

type DispatchPros = {
    showProfile: typeof showProfile,
    updateSetting: typeof updateSetting;
    showSettings: typeof showSettings;
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps;

class NearbyScreenBase extends AuditedScreen<Props, State> {
    mounted: boolean = true;
    listeners: NavigationEventSubscription[] = [];
    removeWatcher?: () => void;

    constructor(props) {
        super(props, AuditScreenName.NearbyMembers);
        this.state = {
            visible: true,
        };
    }

    async componentDidMount() {
        this.listeners = [
            this.props.navigation.addListener('didFocus', this._focus),
            this.props.navigation.addListener('didBlur', this._blur),
        ];

        this.audit.submit();
    }

    _focus = () => { if (this.mounted) { this.setState({ visible: true }); } }
    _blur = () => { if (this.mounted) { this.setState({ visible: false }); } }

    handleAppStateChange = (nextAppState: string) => {
        if (nextAppState !== 'active') {
            return;
        }

        this.didFocus();
    }

    async didFocus() {
        if (!await Location.isBackgroundLocationAvailableAsync()) {
            this.setState({ message: I18N.NearbyMembers.notsupported, canSet: false });
            return;
        }

        const result = await Permissions.askAsync(Permissions.LOCATION);

        if (result.status != "granted") {
            this.setState({
                message: I18N.NearbyMembers.permissions,
                canSet: Platform.OS == "ios",
            });
            return;
        } else {
            if (Platform.OS == "ios" && (!result.permissions.location || !result.permissions.location.ios || result.permissions.location.ios.scope !== "always")) {
                this.setState({
                    message: I18N.NearbyMembers.always,
                    canSet: Platform.OS == "ios",
                });
                return;
            }

            this.setState({ message: undefined });
        }
    }

    componentWillMount() {
        this.mounted = true;
        this.didFocus();
        this.audit.submit();

        AppState.addEventListener('change', this.handleAppStateChange);
    }

    componentWillUnmount() {
        this.mounted = false;

        if (this.removeWatcher) {
            this.removeWatcher();
        }

        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    _tryopen = () => {
        Linking.canOpenURL('app-settings:').then((supported) => {
            if (!supported) {
                logger.log('Can\'t handle settings url');
            } else {
                Linking.openURL('app-settings:');
            }
        }).catch(logger.error);
    }

    _enable = () => {
        this.props.updateSetting({
            name: "nearbyMembers",
            value: true,
        });

        this.didFocus();
    }

    render() {
        logger.log(this.props);

        return (
            <ScreenWithHeader header={{
                showBack: true,
                content:
                    [
                        <Appbar.Content key="cnt" titleStyle={{ fontFamily: this.props.theme.fonts.medium }} title={I18N.NearbyMembers.title} />,
                        // <Appbar.Action key="filter" icon="filter-list" onPress={() => {}} />,
                        <Appbar.Action key="settings" icon="settings" onPress={() => this.props.showSettings()} />,
                    ]
            }}>
                {this.props.offline &&
                    <CannotLoadWhileOffline />
                }

                {!this.props.nearbyMembers && !this.props.offline &&
                    <Message theme={this.props.theme} text={I18N.NearbyMembers.off} button={I18N.NearbyMembers.on} onPress={this._enable} />
                }

                {this.props.nearbyMembers && !this.props.offline && this.state.message &&
                    <Message theme={this.props.theme} text={this.state.message} button={I18N.NearbyMembers.setlocation} onPress={this._tryopen} />
                }

                {this.props.nearbyMembers && !this.props.offline && !this.state.message && this.props.location && this.props.address &&
                    <ScrollView>
                        <Query<NearbyMembers, NearbyMembersVariables>
                            query={GetNearbyMembersQuery}
                            variables={
                                {
                                    location: {
                                        longitude: this.props.location.coords.longitude,
                                        latitude: this.props.location.coords.latitude
                                    }
                                }
                            }
                            pollInterval={this.state.visible ? POLL_INTERVAL : undefined}
                        >
                            {({ loading, data, error, refetch }) => {
                                if (error) return null;

                                if (data == null || data.nearbyMembers == null) {
                                    return (
                                        <>
                                            <MeLocation now={Date.now()} />
                                            <View style={{ marginHorizontal: 16 }}><InlineLoading /></View>
                                        </>
                                    );
                                }

                                if (data.nearbyMembers.length == 0) {
                                    return (
                                        <>
                                            <MeLocation now={Date.now()} />
                                            <List.Section title={I18N.NearbyMembers.title}>
                                                <Text style={{ marginHorizontal: 16 }}>{I18N.Members.noresults}</Text>
                                            </List.Section>
                                        </>
                                    );
                                }

                                logger.log("found", data.nearbyMembers.length);

                                return <>
                                    <MeLocation now={Date.now()} />
                                    {
                                        makeGroups(data.nearbyMembers).map((s, i) =>
                                            <List.Section title={I18N.NearbyMembers.near(s.title)} key={i.toString()}>
                                                {
                                                    s.members.map(m =>
                                                        (
                                                            <React.Fragment key={m.member.id}>
                                                                <InternalMemberListItem
                                                                    theme={this.props.theme}
                                                                    member={m.member}
                                                                    onPress={() => this.props.showProfile(m.member.id)}

                                                                    title={<MemberTitle member={m.member} />}
                                                                    subtitle={
                                                                        distance(m.distance) + ", " + I18N.NearbyMembers.ago(
                                                                            timespan(
                                                                                Date.now(),
                                                                                new Date(m.lastseen).getTime()
                                                                            ))
                                                                    }
                                                                />
                                                                <Divider inset={true} />
                                                            </React.Fragment>
                                                        )
                                                    )
                                                }
                                            </List.Section>
                                        )
                                    }
                                </>;
                            }}
                        </Query>
                    </ScrollView>
                }
            </ScreenWithHeader>
        );
    }
}

export const NearbyScreen = connect<StateProps, DispatchPros, OwnProps, IAppState>(
    (state) => ({
        location: state.location.location,
        address: state.location.address,
        timestamp: state.location.timestamp,
        nearbyMembers: state.settings.nearbyMembers,
        offline: state.connection.offline
    }),
    {
        showProfile,
        updateSetting,
        showSettings,
    })(withNavigation(withTheme(NearbyScreenBase)));


