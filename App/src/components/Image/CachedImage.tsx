import React from "react";
import { Animated, Image, Platform, StyleSheet, View } from "react-native";
import { Theme } from 'react-native-paper';
import { Categories, Logger } from '../../helper/Logger';
import CacheManager from "./CacheManager";
import { DownloadOptions } from "./DownloadOptions";
type ImageProps = {
  style?: any;

  preview?: React.ReactElement;
  options?: DownloadOptions;

  uri?: string;
  transitionDuration?: number;

  theme: Theme,
};

type ImageState = {
  uri?: string;
  intensity: Animated.Value;
};

const logger= new Logger(Categories.Helpers.ImageCache);

export class CachedImage extends React.PureComponent<ImageProps, ImageState> {
  mounted = true;
  requestId = 0;

  state = {
    uri: undefined,
    intensity: new Animated.Value(0)
  };

  async load({ uri, options = {} }: ImageProps, request: number): Promise<void> {
    if (uri) {
      const path = await CacheManager.get(uri, options).getPath();

      if (this.requestId !== request) {
        logger.debug("Ignoring image request", uri, "already unloaded");
        return;
      }

      if (this.mounted) {
        this.setState({ uri: path });
      }
    }
  }

  componentDidMount() {
    this.load(this.props, ++this.requestId);
  }

  componentDidUpdate(prevProps: ImageProps, prevState: ImageState) {
    const { preview } = this.props;
    const { uri } = this.state;

    if (this.props.uri !== prevProps.uri) { // || this.props.preview !== prevProps.preview) {
      this.setState({uri: undefined, intensity: new Animated.Value(0)});
      this.load(this.props, ++this.requestId);
    } else if (uri && preview && prevState.uri === undefined) {
      this.startAnimation();
    }
  }

  startAnimation() {
    const { transitionDuration } = this.props;
    const { intensity } = this.state;

    Animated.timing(intensity, {
      duration: transitionDuration || 300,
      toValue: 100,
      // android does not change the image otherwise
      useNativeDriver: Platform.OS == "android" ? false : true,
    }).start();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { preview, style } = this.props;
    const { uri, intensity } = this.state;

    const hasPreview = !!preview;
    const isImageReady = !!uri;

    const opacity = intensity.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0]
    });

    return (
      <View style={styles.container}>
        {isImageReady && (
          <Image
            source={{ uri }}
            style={style || styles.imageStyles}
            fadeDuration={hasPreview ? 0 : undefined}
          />
        )}

        {hasPreview &&
          <Animated.View style={[styles.container, { opacity }]}>
            {preview}
          </Animated.View>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",

    position: "absolute",
    top: 0, bottom: 0,
    left: 0, right: 0,
  },

  imageStyles: {
    resizeMode: "contain",
    position: "absolute",
    top: 0, bottom: 0,
    left: 0, right: 0,
  }
});
