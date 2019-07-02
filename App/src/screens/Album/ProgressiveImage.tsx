import React from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';

type Props = {
    thumbnailSource: any,
    source: any,
    style?: any,
}

class ProgressiveImage extends React.PureComponent<Props> {
    imageAnimated = new Animated.Value(0);

    onImageLoad = () => {
        Animated.timing(this.imageAnimated, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    }

    render() {
        const {
            thumbnailSource,
            source,
            style,
            ...props
        } = this.props;

        return (
            <View>
                <Image
                    {...props}
                    source={thumbnailSource}
                    style={[styles.imageOverlay]}
                    fadeDuration={0}
                />

                <Animated.Image
                    {...props}

                    source={source}
                    style={[styles.imageOverlay, { opacity: this.imageAnimated }, style]}

                    onLoad={this.onImageLoad}
                    fadeDuration={0}
                />
            </View>
        );
    }
}

export default ProgressiveImage;

const styles = StyleSheet.create({
    imageOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
    },
});

