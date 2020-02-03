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
        if (uri && this.requestId === request && this.mounted) {
            const path = await CacheManager.get(uri, options, cacheGroup).getPath();
            // if (__DEV__) { logger.debug('Loaded image', path, request); }

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
        // tslint:disable-next-line: no-increment-decrement
        this.load(this.props, ++this.requestId);
    }

    componentDidUpdate(prevProps: ImageProps, _prevState: ImageState) {
        if (this.props.uri !== prevProps.uri) {
            this.setState({ uri: undefined, intensity: new Animated.Value(0), hidePreview: false });

            // tslint:disable-next-line: no-increment-decrement
            this.load(this.props, ++this.requestId);
        }
    }

    _startAnimation = () => {
        const { transitionDuration } = this.props;
        const { intensity } = this.state;

        const request = this.requestId;
        // if (__DEV__) { logger.debug('Hiding preview', request); }

        // if (Platform.OS === 'android') {
        //     this.setState({ hidePreview: true });
        // } else {
        Animated.timing(intensity, {
            duration: transitionDuration || 300,
            toValue: 100,
            useNativeDriver: true,
        }).start(() => {
            if (this.mounted && request === this.requestId) {
                this.setState({ hidePreview: true });
            }
        });

        this.forceUpdate();
        // }
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

        const flattened = style ? StyleSheet.flatten(style) : null;

        return (
            <View style={styles.container}>
                {isImageReady && (
                    <Image
                        source={{ uri }}
                        style={flattened || styles.imageStyles}
                        onLoadEnd={this._startAnimation}
                        fadeDuration={hasPreview ? 0 : undefined}
                        resizeMode={this.props.resizeMode || flattened?.resizeMode || 'contain'}
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
        ...StyleSheet.absoluteFillObject,
    },

    imageStyles: {
        ...StyleSheet.absoluteFillObject,
    },
});
