import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React from 'react';
import { Image } from 'react-native';
import Assets from '../Assets';
import { Categories, Logger } from '../helper/Logger';
import { bootstrapLanguage } from '../i18n/bootstrapLanguage';

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

        async componentDidMount() {
            try {
                await SplashScreen.preventAutoHideAsync();
            }
            // hot reload does not show the screen again, we have to mask this
            catch { }

            await this.loadAssetsAsync();
        }

        async loadAssetsAsync() {
            try {
                const imageAssets = cacheImages(
                    Object.keys(Assets.images).map(
                        (k) => Assets.images[k],
                    ),
                );

                const fileAssets = cacheFiles(
                    Object.keys(Assets.files).map(
                        (k) => Assets.files[k],
                    ));

                // await MaterialIcons.loadFont();
                // await Ionicons.loadFont();

                // await Font.loadAsync({
                //     normal: Assets.fonts.normal,
                //     bold: Assets.fonts.bold,
                //     light: Assets.fonts.light,
                // });

                await Promise.all([
                    MaterialIcons.loadFont(),
                    Ionicons.loadFont(),
                    Font.loadAsync({
                        normal: Assets.fonts.normal,
                        bold: Assets.fonts.bold,
                        light: Assets.fonts.light,
                    }),
                    ...imageAssets,
                    ...fileAssets,
                    bootstrapLanguage(),
                ]);

                logger.log('Done.');
            } catch (e) {
                logger.error('pre-cache', e);
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
