import { Platform, StyleSheet } from 'react-native';
import { ITEM_HEIGHT } from './Dimensions';

// tslint:disable-next-line: export-name
export const styles = StyleSheet.create({
    flag: {
        marginRight: 4,
        marginTop: 2,

        width: 10 / 3 * 4,
        height: 10,
    },

    cardTitle: {
        height: ITEM_HEIGHT - (Platform.OS == 'ios' ? 0 : 8),
        // width: ITEM_WIDTH
    },

    chipContainer: {
        marginTop: Platform.OS == 'ios' ? 0 : 8,
        marginLeft: 56,
        flexDirection: 'row',
        alignItems: 'flex-start',
        alignContent: 'center',
        flexWrap: 'wrap',
        marginBottom: 4,
    },

    chip: {
        borderRadius: 10,
        paddingHorizontal: 6,
        marginRight: 4,
        marginBottom: 4,

        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },

    chipText: {
        marginVertical: Platform.OS == 'ios' ? 4 : 1,
        fontSize: 10,
    },

    titleContainer: {
        fontSize: 16,
        lineHeight: 18,
        marginBottom: 0,
        minHeight: 20,
    },

    subTitleContainer: {
        fontSize: 12,
        lineHeight: 14,
        minHeight: Platform.OS == 'ios' ? 13 : undefined,
        // height: Platform.OS == "ios" ? undefined : 23,
    },

    title: {
        fontSize: 16,
    },
});
