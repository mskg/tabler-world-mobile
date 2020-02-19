import { Ionicons } from '@expo/vector-icons';
import color from 'color';
import React from 'react';
import { IconButton, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { CachedImage } from '../../../components/Image/CachedImage';
import { InternalMemberListItem } from '../../../components/Member/InternalMemberListItem';
import { InternalMemberListItemFooter } from '../../../components/Member/InternalMemberListItemFooter';
import { MemberTitle } from '../../../components/Member/MemberTitle';
import { RoleChip } from '../../../components/Member/RoleChip';
import { RoleChips } from '../../../components/Member/RoleChips';
import { formatDistance } from '../../../helper/formatting/formatDistance';
import { formatTimespan } from '../../../helper/formatting/formatTimespan';
import { I18N } from '../../../i18n/translation';
import { Features, isFeatureEnabled } from '../../../model/Features';
import { MemberOverviewFragment, MemberOverviewFragment_roles } from '../../../model/graphql/MemberOverviewFragment';
import { NearbyMembers_nearbyMembers_member } from '../../../model/graphql/NearbyMembers';
import { IAppState } from '../../../model/IAppState';
import { showProfile, startConversation } from '../../../redux/actions/navigation';

type OwnProps = {
    member: NearbyMembers_nearbyMembers_member,

    distance: number,
    lastseen: Date,
};

type StateProps = {
};

type DispatchPros = {
    showProfile: typeof showProfile,
};

type Props = OwnProps & StateProps & DispatchPros & { theme } & NavigationInjectedProps;

class NearbyMemberItemBase extends React.PureComponent<Props> {

    _startConversation = () => {
        requestAnimationFrame(async () =>
            this.props.navigation.dispatch(await startConversation(
                this.props.member.id,
                `${this.props.member.firstname} ${this.props.member.lastname}`,
            )));
    }

    _showProfile = () => this.props.showProfile(this.props.member.id);

    _renderFooter = (member: MemberOverviewFragment) => {
        const chipColor = color(this.props.theme.colors.text)
            .alpha(0.87)
            .rgb()
            .string();

        return (
            <InternalMemberListItemFooter>
                <RoleChip
                    color={this.props.theme.colors.primary}
                    textColor={chipColor}
                    font={this.props.theme.fonts.medium}
                    level={
                        this.props.member.association.flag ? (
                            <CachedImage
                                containerStyle={{ paddingRight: 5 }}
                                style={{ width: 12, height: 12, borderRadius: 12 }}
                                cacheGroup={'other'}
                                uri={this.props.member.association.flag}
                                resizeMode={'cover'}
                            />
                        ) : undefined
                    }
                    text={this.props.member.club.name}
                />

                {member.roles && member.roles.length > 0 &&
                    < RoleChips theme={this.props.theme} roles={member.roles as MemberOverviewFragment_roles[]} />
                }

            </InternalMemberListItemFooter>
        );
    }

    // tslint:disable-next-line: max-func-body-length
    render() {
        return (
            <InternalMemberListItem
                theme={this.props.theme}
                member={this.props.member}
                onPress={this._showProfile}

                title={<MemberTitle member={this.props.member} />}
                subtitle={
                    // tslint:disable-next-line: prefer-template
                    formatDistance(this.props.distance)
                    + ', '
                    + I18N.format(
                        I18N.Screen_NearbyMembers.ago,
                        {
                            timespan: formatTimespan(
                                Date.now(),
                                new Date(this.props.lastseen).getTime(),
                            ),
                        },
                    )
                }

                bottom={this._renderFooter}

                right={
                    ({ size }) => isFeatureEnabled(Features.Chat) && this.props.member.availableForChat
                        ? (
                            <IconButton
                                style={{ marginRight: 32 }}
                                size={size}
                                icon={({ size: iconSize, color: c }) => (<Ionicons name="md-chatboxes" color={c} size={iconSize} />)}
                                color={this.props.theme.colors.accent}
                                onPress={this._startConversation}
                            />
                        )
                        : undefined
                }
            />
        );
    }
}

export const NearbyMemberItem = connect<StateProps, DispatchPros, OwnProps, IAppState>(
    null,
    {
        showProfile,
    },
)(
    withTheme(withNavigation(NearbyMemberItemBase)));
