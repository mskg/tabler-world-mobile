import { Dimensions, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    imageThumbnail: {
        height: Dimensions.get('screen').width / 4 - 3,
        width: Dimensions.get('screen').width / 4 - 3,
    },

    imageContainer: {
        flex: 1 / 4,
        margin: 1,
    },

    container: {
        paddingVertical: 0,
    },


    image: {
        position: 'absolute',
        top: 0, bottom: 0,
        left: 16, right: 16,

        resizeMode: 'contain',
    },
});
