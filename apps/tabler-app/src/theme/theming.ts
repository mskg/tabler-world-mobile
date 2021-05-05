import { AppTheme } from './AppTheme';
import { dark } from './dark';
import { light } from './light';

export function determineTheme(colorScheme: string, darkMode?: boolean): AppTheme {
    if (colorScheme === 'no-preference') {
        return darkMode ? dark : light;
    }

    return colorScheme === 'dark' ? dark : light;
}

export function updateTheme(theme: AppTheme, accent: string) {
    return {
        ...theme,
        colors: {
            ...theme.colors,
            accent,
        },
    };
}

