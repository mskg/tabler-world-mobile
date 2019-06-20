import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        width: "100%",
    },

    header: {
        alignItems: 'center',
        width: "100%",
    },

    title: {
        paddingTop: 16-10,
        marginVertical: 0,
    },

    subTitle: {
        marginVertical: 0,
    },

    titlePlaceholder: {
        marginBottom: 4,
         marginTop: 16
    },

    subTitlePlaceholder: {
        marginVertical: 4
    },

    divider: {
        marginLeft: 16,
    },

    // actions: {
    //     flexDirection: "row",
    //     alignItems: "flex-start",
    //     // paddingHorizontal: 16,
    //     width: "100%",
    //     marginVertical: 16,
    //     justifyContent: 'space-around',
    // },

    // actions2: {
    //     flexDirection: "row",
    //     alignItems: "flex-start",
    //     width: "100%",
    //     marginBottom: 16,
    //     justifyContent: 'space-around',
    // },


    section: {
        flexDirection: "row",
        // paddingVertical: 4,
        alignItems: "flex-start",
    },

    sectionIcon: {
        marginLeft: 8,

        // paddingHorizontal: 16,
        paddingLeft: 0,
        paddingRight: 0,
        paddingVertical: 8,
    },

    sectionSecondIcon: {
        marginHorizontal: 8,
        paddingLeft: 8,
        paddingRight: 13,
        paddingVertical: 8,
    },

    sectionElements: {
        flexDirection: "column",
        flex: 1,
        marginVertical: 8,
        marginRight: -16,
    },

    row: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginLeft: 8,
        marginRight: 16,
        marginBottom: 8,
    },
});
