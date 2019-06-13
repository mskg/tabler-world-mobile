import { Platform, StyleSheet } from "react-native";
import { Colors } from 'react-native-paper';
import { HEADER_HEIGHT, TOTAL_HEADER_HEIGHT } from '../../theme/dimensions';

export const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        right: 0,
        left: 0,
        top: 0,
        bottom: 0,
        opacity: 0.25,
    },
    chips: {
        paddingBottom: 8,
        paddingRight: 8,
        flexDirection: "row",
        alignItems: "flex-start",
        alignContent: "center",
        flexWrap: "wrap",
    },
    chip: {
        marginTop: 8,
        marginLeft: 8,
    },
    popup: {
        width: 250,
        position: "absolute",
        right: 0,
        top: (Platform.OS == "ios" ? TOTAL_HEADER_HEIGHT : HEADER_HEIGHT) + 3,
        paddingBottom: TOTAL_HEADER_HEIGHT + 3,
        bottom: 0,
        borderWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: 0,
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 8,
        borderBottomWidth: 12,
        borderLeftWidth: 8,
        position: "absolute",
        top: (Platform.OS == "ios" ? TOTAL_HEADER_HEIGHT : HEADER_HEIGHT) - 8,
        right: 28,
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
        borderLeftColor: 'transparent',
    },
    section: {
        marginBottom: 16,
    },
    title: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    top: {
        flex: 1,
        height: 65,
        // backgroundColor: "red",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "flex-start",
        // marginTop: 6,
        paddingHorizontal: 8,
    },
    search: {
        flex: 1,
    },
    searchbar: {
        height: 40,
        borderRadius: 5,
        elevation: 1,
    },
    row: {
        backgroundColor: Colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
});
