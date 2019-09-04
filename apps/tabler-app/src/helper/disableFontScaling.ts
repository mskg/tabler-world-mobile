import { Text, TextInput } from 'react-native';

export function disableFontScaling() {
    // @ts-ignore property exists
    Text.defaultProps = Text.defaultProps || {};
    // @ts-ignore property exists
    Text.defaultProps.allowFontScaling = false;

    // @ts-ignore property exists
    TextInput.defaultProps = Text.defaultProps || {};
    // @ts-ignore property exists
    TextInput.defaultProps.allowFontScaling = false;
}

