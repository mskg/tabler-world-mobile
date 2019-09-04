import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({

    heading: {
        flexDirection: 'row',
    },

    headingImage: {
        width: '100%',
        height: 100,
    },

    errorMessage: {
        marginTop: 20,
    },

    demo: {
        marginTop: 80,
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },

    demoText: {
        textDecorationLine: 'underline',
        paddingRight: 8,
        // fontSize: 16,
    },

    inputContainer: {
        // maxHeight: 50,
        marginTop: 20,
    },

    button: {
        // width: 130,
        marginRight: 10,
    },

    buttonContainer: {
        display: 'flex',
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'flex-start',

        marginBottom: 40,
    },

    container: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        paddingHorizontal: 40,
        // paddingBottom: 100,
    },

    greeting: {
        marginTop: 20,
    },
    greeting2: {
        marginTop: 5,
    },
});
