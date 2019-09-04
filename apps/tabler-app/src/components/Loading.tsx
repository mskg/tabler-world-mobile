import { SplashScreen } from 'expo';
import React from 'react';
import { Image, StatusBar, StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import Assets from '../Assets';
import { ___DONT_USE_ME_DIRECTLY___COLOR_ACCENT } from '../theme/colors';

export default class Loading extends React.PureComponent {
    // state = {
    //     hide: false
    // }

    async componentDidMount() {
        setTimeout(() => {
            SplashScreen.hide();
        },         1000);
    }

    // resources are preloaded by withPreCached
    render() {
        return null;

        // we don't neeed that, we introduced the timeout to remove the flickering
        return (
            <View style={{ flex: 1 }}>
                <StatusBar hidden={true} />
                <Image
                    style={styles.image}
                    source={Assets.images.splash}

                    onLoadEnd={() => {
                        // wait for image's content to fully load [`Image#onLoadEnd`]
                        // (https://facebook.github.io/react-native/docs/image#onloadend)
                        // Image is fully presented, instruct SplashScreen to hide

                        SplashScreen.hide();
                    }}

                    // we need to adjust Android devices
                    // (https://facebook.github.io/react-native/docs/image#fadeduration)
                    // fadeDuration prop to `0` as it's default value is `300`
                    fadeDuration={0}
                />

                <View style={styles.center}>
                    <InlineLoading />
                </View>
            </View>
        );
    }
}

export const FullScreenLoading = (...props: any[]) =>
    <View style={StyleSheet.absoluteFill}>
        <View style={[StyleSheet.absoluteFill, styles.center]}>
            <InlineLoading {...props} />
        </View>
    </View>
    ;

export const InlineLoading = (...props: any[]) => <ActivityIndicator size="large" color={___DONT_USE_ME_DIRECTLY___COLOR_ACCENT} {...props} />;

const styles = StyleSheet.create({
    image: {
        flex: 1,
        resizeMode: 'contain',
        width: undefined,
        height: undefined,
    },

    center: {
        // top: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
});