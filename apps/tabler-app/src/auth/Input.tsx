import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

// tslint:disable-next-line: export-name
export default ({ placeholder, style, ...props }) => (
    <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        style={{ ...styles.input, ...style }}
        placeholder={placeholder}
        // placeholderTextColor="#a0a0a0"
        // onChangeText={value => onChangeText(type, value)}
        underlineColorAndroid="transparent"
        {...props}
    />
);

const styles = StyleSheet.create({
    input: {
        height: 30,
        // marginBottom: 15,
        borderBottomWidth: 1.5,
        fontSize: 16,
        paddingHorizontal: 0,
        flex: 1,
        // borderBottomColor: colors.primary,
        // fontFamily: fonts.light
    },
});
