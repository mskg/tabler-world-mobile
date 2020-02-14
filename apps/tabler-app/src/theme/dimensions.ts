import { Platform, StatusBar, StyleSheet } from 'react-native';
import { isIphoneX } from '../helper/isIphoneX';

export const HEADER_MARGIN_TOP = Platform.OS === 'ios'
    ? 28
    : (StatusBar.currentHeight || 38);

export const HEADER_HEIGHT = 56;

export const TOTAL_HEADER_HEIGHT = HEADER_MARGIN_TOP + HEADER_HEIGHT;
// we must consider the nob on the bottom
export const BOTTOM_HEIGHT = isIphoneX() ? 88 : 54;

export const HeaderStyles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        // overflow: "hidden",
        height: HEADER_MARGIN_TOP,
    },

    topBar: {
        backgroundColor: 'transparent',
        marginTop: HEADER_MARGIN_TOP,
        height: HEADER_HEIGHT,
        // alignItems: "center",
        // justifyContent: "center",
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
});
