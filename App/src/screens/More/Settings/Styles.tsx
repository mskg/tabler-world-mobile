import { StyleSheet } from 'react-native';
import { ITEM_HEIGHT } from '../../../components/Member/Dimensions';

export const styles = StyleSheet.create({
    section: {
        marginTop: 16,
        marginBottom: 16,
    },

    select: {
        height: 50,
        alignItems: 'stretch',
    },

    selectContainer: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
    },

    text: {
        paddingHorizontal: 16,
        marginBottom: 16,
        fontSize: 12,
    },

    rowicon: {
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        // paddingVertical: 8,
        paddingHorizontal: 16,
        height: ITEM_HEIGHT,
    },

    row: {
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // paddingVertical: 8,
        paddingHorizontal: 16,
        height: 50,
    },
});
