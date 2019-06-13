import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({

    heading: {
        flexDirection: 'row'
    },
    headingImage: {
        width: "100%",
        height: 46
    },
    errorMessage: {
        marginTop: 20,
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
        display: "flex",
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    container: {
        flex: 1,
        width: "100%",
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingBottom: 100,
    },
    greeting: {
        marginTop: 20,
    },
    greeting2: {
        marginTop: 5,
    }
});
