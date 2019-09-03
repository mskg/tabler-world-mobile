import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    card: {
        elevation: 3,
        marginBottom: 16,

        borderRadius: 8,
    },

    container: {
        padding: 16,
    },

    bottom: {
        height: 8,
    },

    title: {
        paddingRight: 8,
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
