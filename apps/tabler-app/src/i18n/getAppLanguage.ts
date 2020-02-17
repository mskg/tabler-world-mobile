import * as Localization from 'expo-localization';

export type Languages = 'de' | 'fi' | 'is' | 'nl' | 'en';

/**
 * This function returns all the available languages we support natively in the App.
 *
 * Adding a language normally requires redeploying the App to the stores, otherwise
 * the UI and settings are not consistent.
 */
export function getAppLanguage(): Languages {
    let lang = 'unknown';

    try {
        lang = Localization.locale.toLocaleLowerCase();
        // tslint:disable-next-line: no-empty
    } catch { }

    if (lang.startsWith('de')) {
        return 'de';
    }

    // if (lang.startsWith('fi')) {
    //     return 'fi';
    // }

    // if (lang.startsWith('is')) {
    //     return 'is';
    // }

    // if (lang.startsWith('nl')) {
    //     return 'nl';
    // }

    return 'en';
}
