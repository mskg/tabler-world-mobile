import React from 'react';
import { View } from 'react-native';
import { Card, TouchableRipple } from 'react-native-paper';
import { MemberAvatar } from '../MemberAvatar';
import { CardTitle } from './CardTitle';
import { MemberItemProps } from './MemberItemProps';
import { RoleChips } from './RoleChips';
import { styles } from './Styles';

export class InternalMemberListItem extends React.PureComponent<MemberItemProps> {
    _onPress = () => {
      requestAnimationFrame(() => {
        if (this.props.onPress) {
          this.props.onPress(this.props.member);
      }
    });
  }

    _avatar = () => {
      return <MemberAvatar member={this.props.member} />;
  }

    render() {
      const { title, subtitle, member } = this.props;

      return (
      <View style={{
          height: this.props.height,
          backgroundColor: this.props.theme.colors.surface,
        // width: ITEM_WIDTH
      }}>
        <TouchableRipple
          onPress={this.props.onPress ? this._onPress : undefined}
          style={{
              height: this.props.height,
            // width: ITEM_WIDTH,
              margin: 0,
              padding: 0,
          }}>
          <>
            <CardTitle
              style={styles.cardTitle}
              title={title}
              titleStyle={styles.titleContainer}

              subtitle={subtitle}
              subtitleStyle={styles.subTitleContainer}

              left={this._avatar}
              right={this.props.right} />

            {member.roles &&
              <Card.Content style={styles.chipContainer}>
                <RoleChips theme={this.props.theme} roles={member.roles} />
              </Card.Content>
            }
          </>
        </TouchableRipple>
      </View>);
  }
}
