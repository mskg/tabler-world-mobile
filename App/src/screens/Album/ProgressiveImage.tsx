import React from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { FullScreenLoading } from '../../components/Loading';

type Props = {
    thumbnailSource: any,
    source: any,
    style?: any,
}

type State = {
    loaded: boolean
}

class ProgressiveImage extends React.PureComponent<Props, State> {
    imageAnimated = new Animated.Value(0);
    state = {loaded: false};

    onImageLoad = () => {
        Animated.timing(this.imageAnimated, {
            toValue: 1,
            useNativeDriver: true,
        }).start();

        this.setState({loaded: true});
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
                    progressiveRenderingEnabled={true}
                    fadeDuration={0}
                />

                {!this.state.loaded &&
                    <FullScreenLoading />
                }

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

