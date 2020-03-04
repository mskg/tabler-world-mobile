import { StyleSheet, Dimensions } from 'react-native';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../theme/colors';

// tslint:disable-next-line: export-name
export const styles = StyleSheet.create({

    heading: {
        flexDirection: 'row',
    },

    headingImage: {
        width: '100%',
        height: 100,
    },

    errorMessage: {
        marginTop: 16,
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

        flexDirection: 'column',
        marginBottom: 16,
    },

    hint: {
        marginTop: 8,
        fontSize: 12,
        color: ___DONT_USE_ME_DIRECTLY___COLOR_GRAY,
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
        width: Dimensions.get('screen').width,
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
