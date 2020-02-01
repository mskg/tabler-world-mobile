import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { IconButton, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { InternalMemberListItem } from '../../../components/Member/InternalMemberListItem';
import { MemberTitle } from '../../../components/Member/MemberTitle';
import { distance } from '../../../helper/distance';
import { timespan } from '../../../helper/timespan';
import { I18N } from '../../../i18n/translation';
import { NearbyMembers_nearbyMembers_member } from '../../../model/graphql/NearbyMembers';
import { IAppState } from '../../../model/IAppState';
import { showProfile, startConversation } from '../../../redux/actions/navigation';
import { isFeatureEnabled, Features } from '../../../model/Features';

type OwnProps = {
    member: NearbyMembers_nearbyMembers_member,

    distance: number,
    lastseen: Date,
};

type StateProps = {
};

type DispatchPros = {
    showProfile: typeof showProfile,
    startConversation: typeof startConversation,
};

type Props = OwnProps & StateProps & DispatchPros & { theme };

class NearbyMemberItemBase extends React.PureComponent<Props> {

    _startConversation = () => {
        requestAnimationFrame(() =>
            this.props.startConversation(
                this.props.member.id,
                `${this.props.member.firstname} ${this.props.member.lastname}`,
            ));
    }

    _showProfile = () => this.props.showProfile(this.props.member.id);

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
                    distance(this.props.distance) + ', ' + I18N.NearbyMembers.ago(
                        timespan(
                            Date.now(),
                            new Date(this.props.lastseen).getTime(),
                        ))
                }

                right={
                    ({ size }) => isFeatureEnabled(Features.Chat) && this.props.member.availableForChat
                        ? (
                            <IconButton
                                style={{ marginRight: 32 }}
                                size={size}
                                icon={({ size: iconSize, color }) => (<Ionicons name="md-chatboxes" color={color} size={iconSize} />)}
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
        startConversation,
    },
)(
    withTheme(NearbyMemberItemBase));
