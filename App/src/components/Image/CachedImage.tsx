import React from 'react';
import { Animated, Image, ImageResizeMode, StyleSheet, View } from 'react-native';
import { Categories, Logger } from '../../helper/Logger';
import { CacheGroup } from './CacheGroup';
import CacheManager from './CacheManager';
import { DownloadOptions } from './DownloadOptions';

type ImageProps = {
    style?: any;

    preview?: React.ReactElement;
    options?: DownloadOptions;
    cacheGroup?: CacheGroup;

    uri?: string | null;
    transitionDuration?: number;
    resizeMode?: ImageResizeMode,
};

type ImageState = {
    uri?: string;
    intensity: Animated.Value;
    hidePreview: boolean;
};

const logger = new Logger(Categories.Helpers.ImageCache);

export class CachedImage extends React.PureComponent<ImageProps, ImageState> {
    mounted = true;
    requestId = 0;

    state = {
      uri: undefined,
      intensity: new Animated.Value(0),
      hidePreview: false,
  };

    async load({ uri, options = {}, cacheGroup }: ImageProps, request: number): Promise<void> {
      if (uri) {
        const path = await CacheManager.get(uri, options, cacheGroup).getPath();

        if (this.requestId !== request) {
          if (__DEV__) { logger.debug('Ignoring image request', uri, 'already unloaded'); }
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
      if (this.props.uri !== prevProps.uri) {
        this.setState({ uri: undefined, intensity: new Animated.Value(0), hidePreview: false });
        this.load(this.props, ++this.requestId);
    }
  }

    _startAnimation = () => {
      const { transitionDuration } = this.props;
      const { intensity } = this.state;

      const request = this.requestId;

      Animated.timing(intensity, {
        duration: transitionDuration || 300,
        toValue: 100,
        useNativeDriver: true,
    }).start(() => {
        if (this.mounted && request == this.requestId) {
          this.setState({ hidePreview: true });
      }
    });
  }

    componentWillUnmount() {
      this.mounted = false;
  }

    render() {
      const { preview, style } = this.props;
      const { uri, intensity, hidePreview } = this.state;

      const hasPreview = preview != null;
      const isImageReady = uri != null;

      const opacity = intensity.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0],
    });

      return (
      <View style={styles.container}>
        {isImageReady && (
          <Image
            source={{ uri }}
            style={style || styles.imageStyles}
            onLoadEnd={this._startAnimation}
            fadeDuration={hasPreview ? 0 : undefined}
            resizeMode={this.props.resizeMode || 'contain'}
          />
        )}

        {hasPreview && !hidePreview &&
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
      alignItems: 'center',

      position: 'absolute',
      top: 0, bottom: 0,
      left: 0, right: 0,
  },

    imageStyles: {
      position: 'absolute',
      top: 0, bottom: 0,
      left: 0, right: 0,
  },
});
