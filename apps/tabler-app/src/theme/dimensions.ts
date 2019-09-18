import { Platform, StatusBar, StyleSheet } from 'react-native';

export const HEADER_MARGIN_TOP = Platform.OS === 'ios'
    ? 28
    : (StatusBar.currentHeight || 38);

export const HEADER_HEIGHT = 56;

export const TOTAL_HEADER_HEIGHT = HEADER_MARGIN_TOP + HEADER_HEIGHT;
export const BOTTOM_HEIGHT = Platform.OS === 'ios'
    ? 88
    : 54;

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
