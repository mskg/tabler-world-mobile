import React from "react";
import { StyleSheet } from 'react-native';
import { Avatar, Surface, Theme, withTheme } from "react-native-paper";
import { CachedImage } from "./Image/CachedImage";

type Props = {
  theme: Theme;

  source: string | undefined;
  label: string;

  size: number;

  background?: string;
  style?: any;
  containerStyle?: any;
};

class TextImageAvatarBase extends React.PureComponent<Props> {

  render() {
    let { source, label, size, style, containerStyle } = this.props;

    return (
      <Surface
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          ...(containerStyle || {}),
        }}
      >
        <CachedImage
          uri={source}
          preview={
            <Avatar.Text
              style={{
                backgroundColor: this.props.background
                  ? this.props.background
                  : this.props.theme.colors.primary,
                ...(style || {})
              }}

              size={size}
              label={label}
            />
          }

          theme={this.props.theme}
          resizeMode="cover"

          style={[styles.imageStyles, {
            width: size,
            height: size,
            borderRadius: size / 2,
            ...(style || {})
          }]}
        />
      </Surface>
    );
  }
}

export const TextImageAvatar = withTheme(TextImageAvatarBase);


const styles = StyleSheet.create({
  imageStyles: {
    // position: "absolute",
    // top: 0, bottom: 0,
    // left: 0, right: 0,
    // overflow: 'hidden',
  }
});
