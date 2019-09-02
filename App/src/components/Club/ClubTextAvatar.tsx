import color from 'color';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Theme, withTheme } from 'react-native-paper';

type Props = {
    label: string,
    size: number,
    color?: string,
    style?: any,

    theme: Theme,
};

class ClubTextAvatar extends React.Component<Props> {
    render() {
      const { label, size, style, theme } = this.props;

      const { backgroundColor = theme.colors.primary, ...restStyle } = StyleSheet.flatten(style) || {};
      const textColor = this.props.color || (color(backgroundColor).lighten() ? 'rgba(0, 0, 0, .54)' : 'white');

      return (
      <View
        style={[
            {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor,
            },
            styles.container,
            restStyle,
        ]}
      >
        <Text
          style={[
              styles.text,
              {
                  color: textColor,
              // need to reduce the size to allow 3 letters
                  fontSize: size / 2 - 3,
                  lineHeight: size,
              },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
  },
    text: {
      textAlign: 'center',
      textAlignVertical: 'center',
  },
});

export default withTheme(ClubTextAvatar);
