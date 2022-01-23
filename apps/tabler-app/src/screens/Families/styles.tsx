import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    card: {
        elevation: 3,
        marginBottom: 16,

        borderRadius: 8,
    },

    bottom: {
        height: 8,
    },

    container: {
        padding: 16,
    },

    imageContainer: {
        height: 100,
        // backgroundColor: grey200,
        paddingHorizontal: 16,
        overflow: 'hidden',
        borderRadius: 8,
        marginTop: 8,
    },

    image: {
        position: 'absolute',
        top: 0, bottom: 0,
        left: 16, right: 16,

        resizeMode: 'contain',
    },

    accordeon: {
        paddingHorizontal: 12,
    },
});
