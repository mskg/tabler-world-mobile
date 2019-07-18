import { SplashScreen } from "expo";
import React from "react";
import { Image, StatusBar, StyleSheet, View } from "react-native";
import { ActivityIndicator } from 'react-native-paper';
import Assets from "../Assets";
import { ___DONT_USE_ME_DIRECTLY___COLOR_ACCENT } from '../theme/colors';

export default class Loading extends React.PureComponent {
    // resources are preloaded by withPreCached
    render() {
        return (
            <View style={{ flex: 1 }}>
                <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />
                <Image
                    style={styles.image}
                    source={Assets.images.splash}

                    onLoadEnd={() => {
                        // wait for image's content to fully load [`Image#onLoadEnd`]
                        // (https://facebook.github.io/react-native/docs/image#onloadend)
                        SplashScreen.hide(); // Image is fully presented, instruct SplashScreen to hide
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
    <View style={{ flex: 1, position: "absolute", top: 0, bottom: 0, left: 0, right: 0, }}>
        <View style={styles.center}>
            <InlineLoading {...props} />
        </View>
    </View>
;

export const InlineLoading = (...props: any[]) => <ActivityIndicator size="large" color={___DONT_USE_ME_DIRECTLY___COLOR_ACCENT} {...props} />;

const styles = StyleSheet.create({
    image: {
        flex: 1,
        resizeMode: "contain",
        width: undefined,
        height: undefined
    },

    center: {
        position: 'absolute',
        top: 100, left: 0,
        right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
})