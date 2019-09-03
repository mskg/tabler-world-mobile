import { StyleSheet } from 'react-native';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../../theme/colors';

export const styles = StyleSheet.create({
    card: {
        elevation: 3,
        marginBottom: 16,

        borderRadius: 8,
    },

    container: {
        padding: 16,
    },

    author: {
        flexDirection: 'row',
        paddingTop: 8,
        alignItems: 'center',
    },

    authorIcon: {
        paddingLeft: 8,
    },

    images: {
        flex: 1,
        alignItems: 'flex-end',
    },

    text: {
        flexGrow: 1,
        marginTop: 32,
    },

    outerContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },

    bottom: {
        height: 16,
    },

    title: {
        paddingRight: 8,
    },

    button: {
        color: ___DONT_USE_ME_DIRECTLY___COLOR_GRAY,
        marginTop: 5,
    },

    action: {
        justifyContent: 'flex-end',
        marginRight: 8,
    },

    searchbar: {
        height: 40,
        borderRadius: 5,
        elevation: 1,

        marginBottom: 16,
    },

    imageContainer: {
        marginTop: 16,

        paddingLeft: 8,
        paddingRight: 16,
        height: 60,

        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'hidden',
    },

    imagePreview: {
        marginLeft: 8,
        width: 60,
        height: 60,
    },
});
