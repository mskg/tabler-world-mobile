import React from "react";
import { StyleSheet } from "react-native";
import { Avatar, Surface, Theme, withTheme } from "react-native-paper";
import { CachedImage } from "./Image/CachedImage";

type Props = {
  theme: Theme;

  source: string | undefined;
  label: string;

  size: number;

  background?: string;
  style: any;
};

export class ClubAvatarBase extends React.PureComponent<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    let { source, theme, label, size } = this.props;
    const { colors } = theme;

    if (source == null || source == "") {
      return (
        <Avatar.Text
          style={{
            backgroundColor: this.props.theme.colors.backdrop,
          }}
          size={size}
          label={label}
        />
      );
    }

    return (
      <Surface
        style={[{
          width: size,
          height: size,
          borderRadius: size / 2,
          color: colors.primary,
          backgroundColor: this.props.theme.colors.surface,
          // overflow: 'hidden',
          elevation: 3,
        }, this.props.style]}
      >
        <CachedImage
          uri={source}
          preview={
            <Avatar.Text
              style={{ backgroundColor: this.props.theme.colors.backdrop, }}
              size={size}
              label={label}
            />
          }

          theme={this.props.theme}
          style={
            [styles.imageStyles,
            {
              top: size/7, bottom: size/7,
              left: size/7, right: size/7,
            }]
          }
        />
      </Surface>
    );
  }
}

export const ClubAvatar = withTheme(ClubAvatarBase);


const styles = StyleSheet.create({
  imageStyles: {
    resizeMode: "contain",
    position: "absolute",
    top: 0, bottom: 0,
    left: 0, right: 0,
    overflow: 'hidden',
  }
});
