import { DarkTheme } from 'react-native-paper';
import { AppTheme } from './AppTheme';
import { ___DONT_USE_ME_DIRECTLY___COLOR_BACKDROP } from './colors';
import { light } from './light';

export const dark: AppTheme = {
    ...DarkTheme,
    roundness: 2,
    fonts: light.fonts,
    colors: {
        ...DarkTheme.colors,

        backdrop: ___DONT_USE_ME_DIRECTLY___COLOR_BACKDROP,

        primary: DarkTheme.colors.background,
        textOnAccent: DarkTheme.colors.text,

        navigation: ___DONT_USE_ME_DIRECTLY___COLOR_BACKDROP,
        notification: 'red',
    },
};
