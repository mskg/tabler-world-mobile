import { StyleSheet } from 'react-native';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../../../theme/colors';

const HEIGHT = 50;

// tslint:disable-next-line: export-name
export const styles = StyleSheet.create({
    section: {
        marginTop: 16,
        marginBottom: 16,
    },

    select: {
        height: HEIGHT,
        alignItems: 'stretch',
    },

    selectContainer: {
        height: HEIGHT,
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
        height: HEIGHT,
    },

    row: {
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // paddingVertical: 8,
        paddingHorizontal: 16,
        height: HEIGHT,
    },

    rowValue: {
        color: ___DONT_USE_ME_DIRECTLY___COLOR_GRAY,
        marginLeft: 8,
    },
});
