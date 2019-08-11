import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import React from 'react';
import { Query } from 'react-apollo';
import { AppState, Linking, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Divider, List, Text, Theme, Title, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { InlineLoading } from '../../components/Loading';
import { InternalMeListItemBase } from '../../components/MeListItem';
import { InternalMemberListItem } from '../../components/Member/InternalMemberListItem';
import { MemberTitle } from '../../components/Member/MemberTitle';
import { ScreenWithHeader } from '../../components/Screen';
import { distance } from '../../helper/distance';
import { Categories, Logger } from '../../helper/Logger';
import { timespan } from '../../helper/timespan';
import { I18N } from '../../i18n/translation';
import { RoleType } from '../../model/graphql/globalTypes';
import { Me } from '../../model/graphql/Me';
import { NearbyMembers, NearbyMembersVariables, NearbyMembers_nearbyMembers } from '../../model/graphql/NearbyMembers';
import { IAppState } from '../../model/IAppState';
import { GetNearbyMembersQuery } from '../../queries/GetNearbyMembers';
import { GetMeQuery } from '../../queries/MeQuery';
import { showProfile } from '../../redux/actions/navigation';
import { updateSetting } from '../../redux/actions/settings';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../../theme/colors';

const logger = new Logger(Categories.Screens.Menu);

type State = {
    message?: string,
    canSet?: boolean,
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    location?: Location.LocationData,
    address?: Location.Address,
    nearbyMembers?: boolean,
};

type DispatchPros = {
    showProfile: typeof showProfile,
    updateSetting: typeof updateSetting;
};

type Props = OwnProps & StateProps & DispatchPros & NavigationInjectedProps;

class NearbyScreenBase extends AuditedScreen<Props, State> {
    removeWatcher?: () => void;

    constructor(props) {
        super(props, AuditScreenName.NearbyMembers);
        this.state = {};
    }

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
        this.didFocus();
        this.audit.submit();

        AppState.addEventListener('change', this.handleAppStateChange);
    }

    componentWillUnmount() {
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
        return (
            <ScreenWithHeader header={{ title: I18N.NearbyMembers.title, showBack: true }}>
                {!this.props.nearbyMembers &&
                    <View style={styles.emptyContainer}>
                        <Ionicons name="md-navigate" size={56 * 1.5} color={___DONT_USE_ME_DIRECTLY___COLOR_GRAY} />
                        <Text style={styles.emptyText}>{I18N.NearbyMembers.off}</Text>

                        <Button
                            color={this.props.theme.colors.accent}
                            onPress={this._enable}
                        >{I18N.NearbyMembers.on}</Button>
                    </View>
                }

                {this.props.nearbyMembers && this.state.message &&
                    <View style={styles.emptyContainer}>
                        <Ionicons name="md-navigate" size={56 * 1.5} color={___DONT_USE_ME_DIRECTLY___COLOR_GRAY} />
                        <Text style={styles.emptyText}>{this.state.message}</Text>

                        {this.state.canSet &&
                            <Button
                                color={this.props.theme.colors.accent}
                                onPress={this._tryopen}
                            >{I18N.NearbyMembers.setlocation}</Button>
                        }
                    </View>
                }

                {this.props.nearbyMembers && !this.state.message && this.props.location && this.props.address &&
                    <ScrollView>
                        <Query<Me>
                            query={GetMeQuery}
                        >
                            {({ loading, data, error, refetch }) => {
                                if (error || data == null || data.Me == null) return null;
                                return (
                                    <List.Section title={I18N.NearbyMembers.location} key={"me"}>
                                        <InternalMeListItemBase
                                            theme={this.props.theme}
                                            title={<Title>{data.Me.firstname} {data.Me.lastname}</Title>}
                                            subtitle={this.props.address.city}
                                            me={data.Me}
                                        />
                                    </List.Section>
                                );
                            }}
                        </Query>

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
                            pollInterval={5000}
                        >
                            {({ loading, data, error, refetch }) => {
                                if (error) return null;

                                if (data == null || data.nearbyMembers == null) {
                                    return (<View style={{ marginHorizontal: 16 }}><InlineLoading /></View>);
                                }

                                logger.log("found", data.nearbyMembers.length);
                                return makeGroups(data.nearbyMembers).map((s, i) =>
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
                                );
                            }}
                        </Query>
                    </ScrollView>
                }
            </ScreenWithHeader >
        );
    }
}

/**
 * Apollo reuses instances, so we create new ones every time
 */
const makeGroups = (data: NearbyMembers_nearbyMembers[]) => {
    let group = {
        title: data[0].address.city as string,
        members: [] as NearbyMembers_nearbyMembers[]
    };

    const result: typeof group[] = [];
    const withRoles = data.map(m => {
        const r = {
            ...m,
            member: {
                ...m.member
            }
        };
        r.member.roles = [... (m.member.roles || []), {
            __typename: "Role",
            name: "Member",
            group: "Member",
            level: m.member.club.name,
            ref: {
                __typename: "RoleRef",
                type: RoleType.club,
                name: "RT" + m.member.club.club,
                id: m.member.club.id,
            }
        }];

        return r;
    })

    for (const member of withRoles) {
        if (member.address.city != group.title) {
            result.push(group);
            group = {
                title: member.address.city as string,
                members: [member],
            }
        } else {
            group.members.push(member);
        }
    }

    result.push(group);
    return result;
}

export const NearbyScreen = connect<StateProps, DispatchPros, OwnProps, IAppState>(
    (state) => ({
        location: state.location.location,
        address: state.location.address,
        nearbyMembers: state.settings.nearbyMembers,
    }),
    {
        showProfile,
        updateSetting,
    })(withNavigation(withTheme(NearbyScreenBase)));


const styles = StyleSheet.create({

    emptyContainer: {
        flex: 1,
        // height: Dimensions.get('window').height,
        alignItems: 'center',
        justifyContent: 'center',

        padding: 16,
    },

    emptyText: {
        paddingVertical: 16,
        fontSize: 20,
        textAlign: 'center',
    },
});