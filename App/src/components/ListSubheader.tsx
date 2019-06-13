import color from 'color';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, Theme, withTheme } from 'react-native-paper';

type Props = {
  theme: Theme,
  style?: any,
};

class ListSubheader extends React.Component<Props> {
  render() {
    const { style, theme, ...rest } = this.props;
    const { colors, fonts } = theme;
    const fontFamily = fonts.medium;
    const textColor = color(colors.text)
      .alpha(0.54)
      .rgb()
      .string();

    return (
      <Text
        numberOfLines={1}
        {...rest}
        style={[styles.container, { color: textColor, fontFamily }, style]}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
});

export default withTheme(ListSubheader);