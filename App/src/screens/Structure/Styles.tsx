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
        marginLeft: 4,
        marginRight: 16,
    },

    searchbar: {
        height: 40,
        borderRadius: 5,
        elevation: 1,

        marginBottom: 16,
    },

    chipContainer: {
        paddingHorizontal: 16,

        flexDirection: "row",
        alignItems: "flex-start",
        alignContent: "center",
        flexWrap: "wrap",
    },

    chip: {
        // borderRadius: 10,
        // paddingHorizontal: 6,
        marginRight: 4,
        marginBottom: 8,
    },

    action: {
        justifyContent: "flex-end",
        marginRight: 8,
    },


    imageContainer: {
        height: 100,
        // backgroundColor: grey200,
        paddingHorizontal: 16,
        overflow: 'hidden',
        borderRadius: 8,
    },

    accordeon: {
        paddingHorizontal: 12,
    },

    image: {
        position: "absolute",
        top: 0, bottom: 0,
        left: 16, right: 16,

        resizeMode: 'contain',
    },

    assocPresident: {
        paddingHorizontal: 16,
        marginVertical: 16,
    },
});
