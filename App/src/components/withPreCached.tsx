import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SplashScreen } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React from 'react';
import { Image } from 'react-native';
import Assets from '../Assets';
import { Categories, Logger } from '../helper/Logger';

const logger = new Logger(Categories.UIComponents.Cache);

function cacheImages(images) {
    return images.map(image => {
        logger.debug('Caching image', image);
        if (typeof image === 'string') {
            return Image.prefetch(image);
        }
        return Asset.fromModule(image).downloadAsync();

    });
}

function cacheFiles(files) {
    return files.map(file => {
        logger.debug('Caching file', file);
        return Asset.fromModule(file).downloadAsync();
    });
}

export function withPreCached(WrappedComponent) {
    return class extends React.PureComponent {
        state = {
            isReady: false,
        };

        constructor(props) {
            super(props);
            SplashScreen.preventAutoHide();
        }

        componentDidMount() {
            this.loadAssetsAsync();
        }

        async loadAssetsAsync() {
            try {
                const imageAssets = cacheImages(
                    Object.keys(Assets.images).map(
                        k => Assets.images[k],
                    ),
                );

                const fileAssets = cacheFiles(
                    Object.keys(Assets.files).map(
                        k => Assets.files[k],
                    ));

                await MaterialIcons.loadFont();
                await Ionicons.loadFont();

                await Font.loadAsync({
                    normal: Assets.fonts.normal,
                    bold: Assets.fonts.bold,
                    light: Assets.fonts.light,
                });

                await Promise.all([...imageAssets, ...fileAssets]);
                logger.log('Done.');
            } catch (e) {
                logger.error(e, 'Initial loading');
            }

            this.setState({ isReady: true });
        }

        render() {
            if (!this.state.isReady) {
                return null;
            }

            return (<WrappedComponent />);
        }
    };
}
