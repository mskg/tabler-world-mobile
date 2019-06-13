import React from 'react';
import { Theme, TouchableRipple, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { Categories, Logger } from '../../helper/Logger';
import { IAppState } from '../../model/IAppState';
import { showProfile } from '../../redux/actions/navigation';
import MemberCover from './MemberRoleCover';

const logger = new Logger(Categories.Screens.Structure);

type Props = {
    role: string;

    member: {
        id: number,
        pic?: string,
        firstname: string,
        lastname: string,
    },

    theme: Theme,
    width: number,

    showProfile: typeof showProfile,
    style?: any,
};

type State = {
};

class RoleAvatarBase extends React.Component<Props, State> {
    _onPress = () =>
        requestAnimationFrame(() =>
            this.props.showProfile(this.props.member.id));

    render() {
        const boardMember = this.props.member;
        if (boardMember == null) return null;

        return (
            <TouchableRipple style={this.props.style} onPress={this._onPress}>
                <MemberCover
                    width={this.props.width}

                    firstname={boardMember.firstname}
                    pic={boardMember.pic}
                    lastname={boardMember.lastname}

                    label={this.props.role}
                />
            </TouchableRipple>
        );
    }
}

export const RoleAvatar = connect(
    (state: IAppState) => ({
    }), {
        showProfile,
    })(withTheme(RoleAvatarBase));
