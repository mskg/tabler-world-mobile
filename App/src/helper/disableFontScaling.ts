import { Text, TextInput } from 'react-native';

export function disableFontScaling() {
    /* disable font scaling */
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.allowFontScaling = false;

    TextInput.defaultProps = Text.defaultProps || {};
    TextInput.defaultProps.allowFontScaling = false;
}

