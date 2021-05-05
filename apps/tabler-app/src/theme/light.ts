import { Colors, DefaultTheme } from 'react-native-paper';
import { AppTheme } from './AppTheme';
import { ___DONT_USE_ME_DIRECTLY___COLOR_ACCENT, ___DONT_USE_ME_DIRECTLY___COLOR_BOTTOM_BAR } from './colors';

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
        backdrop: ___DONT_USE_ME_DIRECTLY___COLOR_BOTTOM_BAR,

        surface: Colors.white,
        background: '#eceef2',
        // background: "green",
        // surface: "red",

        primary: '#f2f2f2',
        accent: ___DONT_USE_ME_DIRECTLY___COLOR_ACCENT,
        navigation: ___DONT_USE_ME_DIRECTLY___COLOR_BOTTOM_BAR,

        error: 'red',
        notification: 'red',
    },
};


