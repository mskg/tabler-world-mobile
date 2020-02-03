import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Dimensions, StyleSheet, View, ViewPropTypes } from 'react-native';
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
                            preview={(
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
                            {...imageProps}
                        />
                    </Lightbox>
                </View>
            );
        }
        return null;
    }
}
