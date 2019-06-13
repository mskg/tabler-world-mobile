import React from 'react';
import { Card, Divider, Theme, TouchableRipple, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { IAppState } from '../../model/IAppState';
import { showProfile } from '../../redux/actions/navigation';
import { MemberTitle } from '../Member/MemberTitle';
import { styles } from '../Member/Styles';
import { MemberAvatar } from '../MemberAvatar';

type Props = {
    role: string;

    member: {
        id: number,
        pic?: string,
        firstname: string,
        lastname: string,
    },

    separator?: boolean,

    theme: Theme,
    showProfile: typeof showProfile,
};

type State = {
};

class RoleCardBase extends React.Component<Props, State> {
    _onPress = () =>
        requestAnimationFrame(() =>
            this.props.showProfile(this.props.member.id));

    render() {
        return (
            <>
                <TouchableRipple onPress={this._onPress}>
                    <Card.Title
                        style={[styles.cardTitle, { marginRight: 16 }]}
                        titleStyle={styles.titleContainer}
                        subtitleStyle={styles.subTitleContainer}

                        left={() => <MemberAvatar member={this.props.member} />}
                        title={<MemberTitle member={this.props.member} />}
                        subtitle={this.props.role}
                    />
                </TouchableRipple>
                {this.props.separator && <Divider inset={true} />}
            </>
        );
    }
}

export const RoleCard = connect(
    (state: IAppState) => ({
    }), {
        showProfile,
    })(withTheme(RoleCardBase));
