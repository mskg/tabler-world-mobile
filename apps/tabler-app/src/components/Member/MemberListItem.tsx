import React from 'react';
import { View } from 'react-native';
import { Caption } from 'react-native-paper';
import { FavoriteButton } from '../FavoriteButton';
import { CachedImage } from '../Image/CachedImage';
import { InternalMemberListItem } from './InternalMemberListItem';
import { MemberItemBaseProps } from './MemberItemBaseProps';
import { MemberTitle } from './MemberTitle';
import { styles } from './Styles';

const Embedded = ({ name, flag, ...props }) => {
    return (
        <View style={{ flexDirection: 'row' }}>
            {flag && (
                <View style={styles.flag}>
                    <CachedImage
                        cacheGroup="other"
                        resizeMode="cover"
                        uri={flag}
                    />
                </View>
            )}

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
                subtitle={<Embedded flag={this.props.member.association.flag} name={this.props.member.club.name} />}
                right={this.props.right || this._right}
                bottom={this.props.bottom}
            />
        );
    }
}
