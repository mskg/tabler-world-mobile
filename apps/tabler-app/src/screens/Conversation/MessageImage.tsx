import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Dimensions, StyleSheet, View, ViewPropTypes, ActivityIndicator } from 'react-native';
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

    makeCacheKey(img?: string) {
        if (!img) { return undefined; }
        return img.replace(/\?.*/ig, '');
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
                <View style={[styles.container, containerStyle]}>
                    <Lightbox
                        activeProps={{
                            style: styles.imageActive,
                            preview: undefined,
                        }}
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
                </View>
            );
        }
        return null;
    }
}
