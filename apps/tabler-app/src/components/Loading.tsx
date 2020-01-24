import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { ___DONT_USE_ME_DIRECTLY___COLOR_ACCENT } from '../theme/colors';

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
