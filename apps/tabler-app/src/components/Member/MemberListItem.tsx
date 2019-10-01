import React from 'react';
import { FavoriteButton } from '../FavoriteButton';
import { InternalMemberListItem } from './InternalMemberListItem';
import { MemberItemBaseProps } from './MemberItemBaseProps';
import { MemberTitle } from './MemberTitle';

export class MemberListItem extends React.PureComponent<{ margin?; } & MemberItemBaseProps> {
    _right = ({ size }) => (
        <FavoriteButton
            theme={this.props.theme}
            member={this.props.member}
            style={{ marginRight: this.props.margin }}
            size={size}
        />)

    render() {
        return (
            <InternalMemberListItem
                theme={this.props.theme}
                member={this.props.member}
                onPress={this.props.onPress}
                height={this.props.height}
                title={<MemberTitle member={this.props.member} />}
                subtitle={this.props.member.club.name}
                right={this.props.right || this._right}
            />
        );
    }
}
