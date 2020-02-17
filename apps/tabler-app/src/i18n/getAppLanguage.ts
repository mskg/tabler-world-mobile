import * as Localization from 'expo-localization';

export type Languages = 'de' | 'fi' | 'is' | 'nl' | 'en';

export function getAppLanguage(): Languages {
    let lang = 'unknown';

    try {
        lang = Localization.locale.toLocaleLowerCase();
        // tslint:disable-next-line: no-empty
    } catch { }

    if (lang.startsWith('de')) {
        return 'de';
    }

    if (lang.startsWith('fi')) {
        return 'fi';
    }

    if (lang.startsWith('is')) {
        return 'is';
    }

    if (lang.startsWith('nl')) {
        return 'nl';
    }

    return 'en';
}
