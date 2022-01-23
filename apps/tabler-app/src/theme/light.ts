import { Colors, DefaultTheme } from 'react-native-paper';
import { AppTheme } from './AppTheme';
import { ___DONT_USE_ME_DIRECTLY___COLOR_BACKDROP } from './colors';

export const light: AppTheme = {
    ...DefaultTheme,
    roundness: 2,
    dark: false,
    fonts: {
        ...DefaultTheme.fonts,
        light: 'light',
        medium: 'bold',
        regular: 'normal',
        thin: 'light',
    },

    colors: {
        ...DefaultTheme.colors,
        backdrop: ___DONT_USE_ME_DIRECTLY___COLOR_BACKDROP,

        surface: Colors.white,
        background: '#eceef2',

        primary: '#f2f2f2',
        textOnAccent: DefaultTheme.colors.text,

        navigation: ___DONT_USE_ME_DIRECTLY___COLOR_BACKDROP,

        error: 'red',
        notification: 'red',
    },
};


