import { AppTheme } from './AppTheme';
import { ___DONT_USE_ME_DIRECTLY___COLOR_BOTTOM_BAR } from './colors';
import { dark } from './dark';
import { Families, getBackdropColor, getFamilyColor, getNavigationColor, getTextColor } from './getFamilyColor';
import { light } from './light';

export function determineTheme(colorScheme: string, darkMode?: boolean): AppTheme {
    if (colorScheme === 'no-preference') {
        return darkMode ? dark : light;
    }

    return colorScheme === 'dark' ? dark : light;
}

export function updateThemeFromFamily(theme: AppTheme, family: Families) {
    const accent = getFamilyColor(family);
    const textOnAccent = getTextColor(family, theme);
    const backdrop = getBackdropColor(family);

    const navigation = theme.dark
        ? ___DONT_USE_ME_DIRECTLY___COLOR_BOTTOM_BAR
        : getNavigationColor(family);

    return {
        ...theme,
        colors: {
            ...theme.colors,
            accent,
            textOnAccent,

            navigation,
            backdrop,
        },
    };
}
