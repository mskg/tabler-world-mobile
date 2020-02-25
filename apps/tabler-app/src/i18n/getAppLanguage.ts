import * as Localization from 'expo-localization';
import { getConfigValue } from '../helper/getConfigValue';

export type Languages = 'de' | 'fi' | 'is' | 'nl' | 'en' | 'it';

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

    const appLanguages = getConfigValue<string[]>('appLanguages');
    const match = appLanguages.find((l) => lang.startsWith(l));

    if (match) {
        return match as Languages;
    }

    return 'en';
}
