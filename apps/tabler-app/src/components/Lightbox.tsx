import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as React from 'react';
import { Dimensions, Image, ImageResizeMode, LayoutAnimation, Platform, Share as ShareNative, StatusBar, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import TransformableImage from 'react-native-image-gallery/src/libraries/TransformableImage';
import { IconButton, Portal, Theme, withTheme } from 'react-native-paper';
import { isIphoneX } from '../helper/isIphoneX';
import { CachedImage } from './Image/CachedImage';
import { CacheGroup } from './Image/CacheGroup';
import CacheManager from './Image/CacheManager';

type Props = {
    theme: Theme,

    containerStyle: any;
    imageStyle: any;

    // cache
    preview?: React.ReactElement;

    cacheGroup?: CacheGroup;
    changeDetectionOverride?: string;
    uri: string;

    transitionDuration?: number;
    resizeMode?: ImageResizeMode,
};

type State = {
    open: boolean,

    uri?: string,
    dimensions?: any,
};

class LightboxBase extends React.Component<Props, State> {
    state: State = {
        open: false,
    };

    _showLightBox = async () => {
        const path = await CacheManager.get(this.props.uri, {}, this.props.cacheGroup).getPath();
        Image.getSize(
            path as string,
            (width, height) => {
                LayoutAnimation.easeInEaseOut();
                this.setState({ open: true, uri: path, dimensions: { width, height } });
            },
            (error) => {
                console.warn(error);
            },
        );
    }

    _close = () => {
        requestAnimationFrame(
            () => {
                LayoutAnimation.spring();
                this.setState({ open: false });
            },
        );
    }

    _export = () => requestAnimationFrame(() => {
        // FileSystem.downloadAsync(
        //     this.state.uri as string,
        //     `${FileSystem.cacheDirectory}share.jpeg`,
        // )
        //     .then(({ uri }) => {
        if (Platform.OS === 'android') {
            Sharing.shareAsync(
                `${FileSystem.cacheDirectory}share.jpeg`,
                {
                    mimeType: 'image/jpeg',
                    UTI: 'image/jpeg',
                },
            );
        } else {
            ShareNative.share({
                url: `${FileSystem.cacheDirectory}share.jpeg`,
            });
        }
        // })
        // .catch((error) => {
        //     // logger.error('ERROR-ID', error);
        // });
    })

    render() {
        if (!this.state.open) {
            return (
                <TouchableWithoutFeedback
                    onPress={this._showLightBox}
                >
                    <View style={[this.props.containerStyle]}>
                        <View style={this.props.imageStyle}>
                            <CachedImage
                                cacheGroup={this.props.cacheGroup}
                                uri={this.props.uri}
                                changeDetectionOverride={this.props.changeDetectionOverride}
                                transitionDuration={this.props.transitionDuration}
                                resizeMode={this.props.resizeMode}
                                style={this.props.imageStyle}
                                preview={this.props.preview}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            );
        }

        return (
            <Portal>
                <StatusBar hidden={true} />
                <View style={[styles.modal, { backgroundColor: this.props.theme.colors.backdrop }]}>
                    {this.state.uri && (
                        <TransformableImage
                            style={styles.imageActive}
                            image={{
                                source: { uri: this.state.uri },
                                dimensions: this.state.dimensions,
                            }}
                        />
                    )}
                </View>

                <IconButton
                    icon="close"
                    color={this.props.theme.colors.accent}
                    onPress={this._close}
                    style={styles.buttonLeft}
                />

                <IconButton
                    icon="share"
                    onPress={this._export}
                    color={this.props.theme.colors.accent}
                    style={styles.buttonRight}
                />
            </Portal>
        );
    }
}

export const Lightbox = withTheme(LightboxBase);

const styles = StyleSheet.create({
    buttonLeft: {
        position: 'absolute',
        top: isIphoneX() ? 40 : 20,
        left: 8,
    },

    buttonRight: {
        position: 'absolute',
        top: isIphoneX() ? 40 : 20,
        right: 8,
    },

    imageActive: {
        width: Dimensions.get('screen').width,
        height: Dimensions.get('screen').height,
    },

    modal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
    },
});
