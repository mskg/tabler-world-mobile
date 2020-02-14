import React, { Component } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { IMessage, MessageImageProps } from 'react-native-gifted-chat';
// @ts-ignore
import { Lightbox } from '../../components/Lightbox';

const styles = StyleSheet.create({
    container: {
        width: 156,
        height: 106,
        padding: 3,
    },

    image: {
        width: 150,
        height: 100,
        borderRadius: 13,
    },

    loading: {
        justifyContent: 'center',
        alignItems: 'center',
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

    makeCacheKey(img?: string) {
        if (!img) { return undefined; }
        return img.replace(/\?.*/ig, '');
    }

    render() {
        const {
            currentMessage,
        } = this.props;

        if (!!currentMessage) {
            return (
                <Lightbox
                    containerStyle={styles.container}
                    imageStyle={styles.image}
                    cacheGroup="chat"
                    uri={currentMessage.image as string}
                    changeDetectionOverride={this.makeCacheKey(currentMessage.image)}
                    transitionDuration={500}
                    resizeMode="cover"
                    preview={(
                        <View style={[styles.image, styles.loading]}>
                            <ActivityIndicator />
                        </View>
                    )}
                />
            );
        }

        return null;
    }
}
