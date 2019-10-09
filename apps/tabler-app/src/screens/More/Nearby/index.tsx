import ApolloClient from 'apollo-client';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import React from 'react';
import { Query } from 'react-apollo';
import { Alert, AppState, Linking, Platform, ScrollView } from 'react-native';
import { Appbar, Divider, List, Text, Theme, withTheme } from 'react-native-paper';
import { NavigationEventSubscription, NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditScreenName } from '../../../analytics/AuditScreenName';
import { withWhoopsErrorBoundary } from '../../../components/ErrorBoundary';
import { InternalMemberListItem } from '../../../components/Member/InternalMemberListItem';
import { MemberTitle } from '../../../components/Member/MemberTitle';
import { CannotLoadWhileOffline } from '../../../components/NoResults';
import { Placeholder } from '../../../components/Placeholder/Placeholder';
import { ScreenWithHeader } from '../../../components/Screen';
import { distance } from '../../../helper/distance';
import { disableNearbyTablers } from '../../../helper/geo/disable';
import { enableNearbyTablers } from '../../../helper/geo/enable';
import { GeoParameters } from '../../../helper/parameters/Geo';
import { getParameterValue } from '../../../helper/parameters/getParameterValue';
import { timespan } from '../../../helper/timespan';
import { I18N } from '../../../i18n/translation';
import { ParameterName } from '../../../model/graphql/globalTypes';
import { NearbyMembers, NearbyMembersVariables } from '../../../model/graphql/NearbyMembers';
import { UpdateLocationAddress, UpdateLocationAddressVariables } from '../../../model/graphql/UpdateLocationAddress';
import { IAppState } from '../../../model/IAppState';
import { GetNearbyMembersQuery } from '../../../queries/GetNearbyMembers';
import { UpdateLocationAddressMutation } from '../../../queries/UpdateLocationAddress';
import { showLocationHistory, showProfile, showSettings } from '../../../redux/actions/navigation';
import { updateSetting } from '../../../redux/actions/settings';
import { geocodeMissing } from './geocodeMissing';
import { logger } from './logger';
import { makeGroups } from './makeGroups';
import { MeLocation } from './MeLocation';
import { MemberListPlaceholder } from './MemberListPlaceholder';
import { Message } from './Message';

type State = {
    message?: string,
    canSet?: boolean,
    visible: boolean,
    interval: number,
    enabling?: boolean,
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
    showLocationHistory: typeof showLocationHistory;
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
            interval: 10 * 1000,
        };
    }

    async componentDidMount() {
        this.mounted = true;

        this.listeners = [
            this.props.navigation.addListener('didFocus', this._focus),
            this.props.navigation.addListener('didBlur', this._blur),
        ];

        this.audit.submit();

        const setting = await getParameterValue<GeoParameters>(ParameterName.geo);
        this.setState({ interval: setting.pollInterval });

        AppState.addEventListener('change', this.handleAppStateChange);
        this.didFocus();
    }

    _focus = () => { if (this.mounted) { this.setState({ visible: true }); } };
    _blur = () => { if (this.mounted) { this.setState({ visible: false }); } };

    handleAppStateChange = (nextAppState: string) => {
        if (nextAppState !== 'active') {
            this._blur();
            return;
        }
        this._focus();


        this.didFocus();
    }

    async didFocus() {
        // prevent checking if not enabled
        if (!this.props.nearbyMembers) {
            return;
        }

        if (!await Location.isBackgroundLocationAvailableAsync()) {
            this.setState({ message: I18N.NearbyMembers.notsupported, canSet: false });
            return;
        }

        const result = await Permissions.askAsync(Permissions.LOCATION);

        if (result.status != 'granted') {
            this.setState({
                message: I18N.NearbyMembers.permissions,
                canSet: Platform.OS == 'ios',
            });
            return;
        }
        if (Platform.OS == 'ios' && (!result.permissions.location || !result.permissions.location.ios || result.permissions.location.ios.scope !== 'always')) {
            this.setState({
                message: I18N.NearbyMembers.always,
                canSet: Platform.OS == 'ios',
            });
            return;
        }

        this.setState({ message: undefined });
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

    _enable = async () => {
        this.setState({ enabling: true });

        try {
            await enableNearbyTablers();
        } catch {
            try { disableNearbyTablers(); } catch { }
            Alert.alert(I18N.Settings.locationfailed);
        }

        this.setState({ enabling: false });
        this.didFocus();
    }

    job?: number;
    _planUpdate = (refetch: () => Promise<any>) => {
        logger.debug('_planUpdate', this.job, this.state.interval, this.mounted);

        if (this.state.interval && this.mounted) {
            this.job = setTimeout(() => {
                if (this.mounted && this.state.visible) {
                    logger.log('Refetching');

                    refetch().finally(() => {
                        this._planUpdate(refetch);
                    });
                }
            }, this.state.interval);
        }
    }

    _checkCode = async (data: NearbyMembers, client: ApolloClient<any>, refetch: () => Promise<any>) => {
        if (this.job) { clearTimeout(this.job); this.job = undefined; }

        if (!this.mounted) {
            logger.debug('Not mounted');
            return;
        }

        if (data.nearbyMembers) {
            logger.debug('Found', data.nearbyMembers.length, 'nearby members.');

            const result = await geocodeMissing(data.nearbyMembers);
            if (result) {
                logger.debug('Updating server store with', result.length, 'new datasets');

                const mutation = client.mutate<UpdateLocationAddress, UpdateLocationAddressVariables>({
                    mutation: UpdateLocationAddressMutation,
                    variables: {
                        corrections: result,
                    },
                });

                logger.debug('update with locations');
                if (this.props.location) {
                    // Read the data from our cache for this query.
                    const data = client.readQuery<NearbyMembers>({
                        query: GetNearbyMembersQuery,
                        variables: {
                            location: {
                                longitude: this.props.location.coords.longitude,
                                latitude: this.props.location.coords.latitude,
                            },

                        },
                    });

                    if (data && data.nearbyMembers) {
                        // Write our data back to the cache with the new comment in it
                        client.writeQuery({
                            query: GetNearbyMembersQuery, data: {
                                nearbyMembers: data.nearbyMembers.map(n => {
                                    if (n.address.city == null && n.address.country == null && n.address.location != null) {
                                        const updated = result.find(r => r.member == n.member.id);
                                        if (updated) {
                                            logger.debug('Updating UI for', n.member.id, 'with', updated.address);
                                            n.address = {
                                                ...n.address,
                                                ...updated.address,
                                            };
                                        }
                                    }

                                    return n;
                                }),
                            } as NearbyMembers,
                        });
                    }
                }

                await mutation;
            }

            this._planUpdate(refetch);
        }
    }

    makeTitle(location, country) {
        if (this.props.address && I18N.Countries.translate(country) != I18N.Countries.translate(this.props.address.country)) {
            return I18N.NearbyMembers.near(location + ', ' + I18N.Countries.translate(country));
        }

        return I18N.NearbyMembers.near(location);
    }

    // tslint:disable-next-line: max-func-body-length
    render() {
        return (
            <ScreenWithHeader
                header={{
                    showBack: true,
                    content: [
                        <Appbar.Content key="cnt" titleStyle={{ fontFamily: this.props.theme.fonts.medium }} title={I18N.NearbyMembers.title} />,
                        // <Appbar.Action key="filter" icon="filter-list" onPress={() => {}} />,
                        <Appbar.Action key="settings" icon="settings" onPress={() => this.props.showSettings()} />,
                    ],
                }}
            >
                {this.state.visible && this.props.offline &&
                    <CannotLoadWhileOffline />
                }

                {this.state.visible && this.state.enabling &&
                    <MemberListPlaceholder />
                }

                {this.state.visible && !this.state.enabling && !this.props.nearbyMembers && !this.props.offline &&
                    <Message
                        theme={this.props.theme}
                        text={I18N.NearbyMembers.off}
                        button={I18N.NearbyMembers.on}
                        onPress={this._enable} />
                }

                {this.state.visible && !this.state.enabling && this.props.nearbyMembers && !this.props.offline && this.state.message &&
                    <Message
                        theme={this.props.theme}
                        text={this.state.message}
                        button={this.state.canSet ? I18N.NearbyMembers.setlocation : undefined}
                        onPress={this._tryopen}
                    />
                }

                {this.state.visible && this.props.nearbyMembers && !this.props.offline && !this.state.message && this.props.location &&
                    <ScrollView>
                        <Query<NearbyMembers, NearbyMembersVariables>
                            query={GetNearbyMembersQuery}
                            variables={
                                {
                                    location: {
                                        longitude: this.props.location.coords.longitude,
                                        latitude: this.props.location.coords.latitude,
                                    },
                                }
                            }
                            // pollInterval={this.state.visible ? this.state.interval : undefined}
                            fetchPolicy="cache-and-network"
                        >
                            {({ data, error, refetch, client }) => {
                                if (error) throw error;

                                if (data != null && data.nearbyMembers != null) {
                                    this._checkCode(data, client, refetch);
                                }

                                return <Placeholder previewComponent={<MemberListPlaceholder />} ready={data != null && data.nearbyMembers != null}>
                                    <MeLocation now={Date.now()} />

                                    {data && data.nearbyMembers && data.nearbyMembers.length == 0 &&
                                        <List.Section title={I18N.NearbyMembers.title}>
                                            <Text style={{ marginHorizontal: 16 }}>{I18N.Members.noresults}</Text>
                                        </List.Section>
                                    }

                                    {data && data.nearbyMembers && data.nearbyMembers.length != 0 &&
                                        makeGroups(data.nearbyMembers).map((s, i) =>
                                            <List.Section title={this.makeTitle(s.title, s.country)} key={i.toString()}>
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
                                                                        // tslint:disable-next-line: prefer-template
                                                                        distance(m.distance) + ', ' + I18N.NearbyMembers.ago(
                                                                            timespan(
                                                                                Date.now(),
                                                                                new Date(m.lastseen).getTime(),
                                                                            ))
                                                                    }
                                                                />
                                                                <Divider inset={true} />
                                                            </React.Fragment>
                                                        ),
                                                    )
                                                }
                                            </List.Section>,
                                        )
                                    }
                                </Placeholder>;
                            }}
                        </Query>
                    </ScrollView>
                }
            </ScreenWithHeader>
        );
    }
}

// tslint:disable-next-line: export-name
export const NearbyScreen = connect<StateProps, DispatchPros, OwnProps, IAppState>(
    (state) => ({
        location: state.location.location,
        address: state.location.address,
        timestamp: state.location.timestamp,
        nearbyMembers: state.settings.nearbyMembers,
        offline: state.connection.offline,
    }),
    {
        showProfile,
        updateSetting,
        showSettings,
        showLocationHistory,
    },
)(
    withWhoopsErrorBoundary(
        withNavigation(
            withTheme(NearbyScreenBase))));
