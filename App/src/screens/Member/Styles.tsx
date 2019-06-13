import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    actions: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingRight: 16,
        width: "100%",
        marginVertical: -10,
        justifyContent: 'space-between',
    },

    actions2: {
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
        paddingVertical: 16,
        justifyContent: 'space-around',
    },

    chip: {
        marginRight: 4,
        marginBottom: 4,
    },

    chipContainer: {
        marginTop: 4,
        flexDirection: "row",
        alignItems: "flex-start",
        alignContent: "center",
        flexWrap: "wrap",
    },
});
