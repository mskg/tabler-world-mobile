import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View, ViewPropTypes } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { IMessage, MessageImageProps } from 'react-native-gifted-chat';
// @ts-ignore
import Lightbox from 'react-native-lightbox';
import { CachedImage } from '../../components/Image/CachedImage';
import { Placeholder } from '../../components/Placeholder/Placeholder';
import { Square } from '../../components/Placeholder/Square';

const styles = StyleSheet.create({
    container: {
        width: 156,
        height: 116,
        padding: 3,
    },

    touchStyle: {
        width: 156,
        height: 116,
        borderRadius: 13,
    },

    image: {
        width: 150,
        height: 100,
        borderRadius: 13,
        resizeMode: 'cover',
    },

    loading: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    imageActive: {
        width: Dimensions.get('screen').width,
        height: Dimensions.get('screen').height,
        resizeMode: 'contain',
    },
});

export class MessageImage<TMessage extends IMessage = IMessage> extends Component<MessageImageProps<TMessage>> {
    static defaultProps = {
        currentMessage: {
            image: null,
        },
        containerStyle: {},
        imageStyle: {},
        imageProps: {},
        lightboxProps: {},
    };

    static propTypes = {
        currentMessage: PropTypes.object,
        containerStyle: ViewPropTypes.style,
        imageStyle: PropTypes.object,
        imageProps: PropTypes.object,
        lightboxProps: PropTypes.object,
    };

    lightBox!: Lightbox;

    makeCacheKey(img?: string) {
        if (!img) { return undefined; }
        return img.replace(/\?.*/ig, '');
    }

    _showLightBox = () => {
        this.lightBox.open();
    }

    render() {
        const {
            containerStyle,
            lightboxProps,
            imageProps,
            imageStyle,
            currentMessage,
        } = this.props;
        if (!!currentMessage) {
            return (
                // android does not trigger the touch event. we workarround that behavior!
                <TouchableWithoutFeedback
                    style={[styles.container, containerStyle]}
                    onPress={this._showLightBox}
                >
                    <Lightbox
                        activeProps={{
                            style: styles.imageActive,
                            preview: undefined,
                        }}
                        ref={(ref) => { this.lightBox = ref; }}
                        {...lightboxProps}
                    >
                        <CachedImage
                            cacheGroup="chat"
                            uri={currentMessage.image}
                            style={[styles.image, imageStyle]}
                            changeDetectionOverride={this.makeCacheKey(currentMessage.image)}
                            transitionDuration={500}
                            preview={(
                                <>
                                    <View style={[styles.image, styles.loading]}>
                                        <ActivityIndicator />
                                    </View>
                                    {false && (
                                        <Placeholder
                                            ready={false}
                                            previewComponent={(
                                                <Square
                                                    width={150}
                                                    height={100}
                                                    style={[styles.image, imageStyle]}
                                                />
                                            )}
                                        />
                                    )}
                                </>
                            )}
                            {...imageProps}
                        />
                    </Lightbox>
                </TouchableWithoutFeedback>
            );
        }
        return null;
    }
}
