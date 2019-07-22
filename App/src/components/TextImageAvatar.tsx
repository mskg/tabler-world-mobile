import React from "react";
import { Avatar, Surface, Theme, withTheme } from "react-native-paper";
import { CachedImage } from "./Image/CachedImage";

type Props = {
  theme: Theme;

  source: string | undefined | null;
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
          cacheGroup="avatar"
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

          resizeMode="cover"

          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            ...(style || {})
          }}
        />
      </Surface>
    );
  }
}

export const TextImageAvatar = withTheme(TextImageAvatarBase);
