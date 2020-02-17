import { Languages } from '../getAppLanguage';
import { replaceCurrentLanguage } from '../translation';

/**
 * This loads the build-in translations and internationalization options
 *
 * @param lang
 */
export function loadLanguage(lang: Languages) {
    // tslint:disable: no-var-requires
    if (lang === 'de') {
        replaceCurrentLanguage(require('./de').default);
    } else if (lang === 'fi') {
        replaceCurrentLanguage(require('./fi').default);
    } else if (lang === 'is') {
        replaceCurrentLanguage(require('./is').default);
    } else if (lang === 'nl') {
        replaceCurrentLanguage(require('./nl').default);
    } else {
        // default
        replaceCurrentLanguage({});
    }
}
