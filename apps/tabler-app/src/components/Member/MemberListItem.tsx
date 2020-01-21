import React from 'react';
import { View } from 'react-native';
import Flag from 'react-native-flags';
import { Caption } from 'react-native-paper';
import { FavoriteButton } from '../FavoriteButton';
import { InternalMemberListItem } from './InternalMemberListItem';
import { MemberItemBaseProps } from './MemberItemBaseProps';
import { MemberTitle } from './MemberTitle';

const Embedded = ({ name, flag, ...props }) => {
    return (
        <View style={{ flexDirection: 'row' }}>
            <Flag code={flag.toUpperCase()} size={16} style={{ marginRight: 4, marginTop: -1 }} />
            <Caption {...props}>
                {name}
            </Caption>
        </View>
    );
};

export class MemberListItem extends React.PureComponent<{ margin?; } & MemberItemBaseProps> {
    _right = ({ size }) => (
        <FavoriteButton
            theme={this.props.theme}
            member={this.props.member}
            style={{ marginRight: this.props.margin }}
            size={size}
        />
    )

    render() {
        return (
            <InternalMemberListItem
                theme={this.props.theme}
                member={this.props.member}
                onPress={this.props.onPress}
                height={this.props.height}
                title={<MemberTitle member={this.props.member} />}
                subtitle={<Embedded flag={this.props.member.association.id} name={this.props.member.club.name} />}
                right={this.props.right || this._right}
                bottom={this.props.bottom}
            />
        );
    }
}
