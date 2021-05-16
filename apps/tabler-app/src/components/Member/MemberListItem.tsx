import React from 'react';
import { View } from 'react-native';
import { Caption, Text, Theme } from 'react-native-paper';
import { IMemberOverviewFragment } from '../../model/IMemberOverviewFragment';
import { getFamilyColor, getTextColor } from '../../theme/getFamilyColor';
import { FavoriteButton } from '../FavoriteButton';
import { CachedImage } from '../Image/CachedImage';
import { MemberAvatar } from '../MemberAvatar';
import { InternalMemberListItem } from './InternalMemberListItem';
import { InternalMemberListItemFooter } from './InternalMemberListItemFooter';
import { MemberTitle } from './MemberTitle';
import { RoleChips } from './RoleChips';
import { styles } from './Styles';

const Embedded = ({ theme, name, flag, family, familyName, icon, ...props }) => {
    const familyColor = getFamilyColor(family);
    const textColor = getTextColor(family, theme);

    return (
        <View style={{ flexDirection: 'row' }}>
            {icon && (
                <View style={[styles.family, { backgroundColor: familyColor }]}>
                    {/* <View style={styles.icon}>
                        <CachedImage
                            cacheGroup="family"
                            resizeMode="cover"
                            uri={icon}
                        />
                    </View> */}
                    <View><Text style={[styles.familyName, { color: textColor }]}>{familyName}</Text></View>
                </View>
            )}

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

type Props = {
    margin?: number,
    member?: IMemberOverviewFragment | null;

    title?: any,
    subtitle?: any,

    theme: Theme;

    onPress?: (member?: IMemberOverviewFragment | null) => void;

    left?: (props: { size: number; }) => React.ReactNode;
    right?: (props: { size: number; }) => React.ReactNode;

    bottom?: () => React.ReactNode;

    height?: number,
};

export class MemberListItem extends React.PureComponent<Props> {
    _right = ({ size }) => this.props.member
        ? (
            <FavoriteButton
                theme={this.props.theme}
                member={this.props.member}
                style={{ marginRight: this.props.margin }}
                size={size}
            />
        )
        : undefined

    _left = ({ size }) => this.props.member
        ? (
            <MemberAvatar size={size} member={this.props.member} />
        )
        : undefined

    _onPress = () => {
        requestAnimationFrame(() => {
            if (this.props.onPress) {
                this.props.onPress(this.props.member);
            }
        });
    }

    _renderBottom = () => {
        if (this.props.bottom) {
            return this.props.bottom();
        }

        if (this.props.member?.roles) {
            return (
                <InternalMemberListItemFooter>
                    <RoleChips theme={this.props.theme} roles={this.props.member.roles} />
                </InternalMemberListItemFooter>
            );
        }

        return null;
    }

    render() {
        return (
            <InternalMemberListItem
                theme={this.props.theme}
                onPress={this._onPress}
                height={this.props.height}
                title={this.props.title || <MemberTitle member={this.props.member} />}
                subtitle={this.props.subtitle || <Embedded theme={this.props.theme} family={this.props.member?.family?.id} familyName={this.props.member?.family?.shortname} icon={this.props.member?.family?.icon} flag={this.props.member?.association?.flag} name={this.props.member?.club?.name} />}
                left={this.props.left || this._left}
                right={this.props.right || this._right}
                bottom={this.props.bottom || this._renderBottom}
            />
        );
    }
}
