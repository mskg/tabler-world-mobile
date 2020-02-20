
import { merge } from 'lodash';
import moment from 'moment';
import { Categories, Logger } from '../helper/Logger';
import { countryName, CountryNameFunc } from './countryName';
import { format, FormatFunc } from './format';
import { formatDate, FormatDateFunc } from './formatDate';
import { getAppLanguage, Languages } from './getAppLanguage';
import { I18NType } from './I18NType';
import { pluralize, PluralizeFunc } from './pluralize';
import DEFAULT_LANGUAGE from './translations/defaultLanguage';

const logger = new Logger(Categories.App);

const currentLanguage: any = {};
export function replaceCurrentLanguage(otherLang: any) {
    logger.log('replaceCurrentLanguage', otherLang.id);

    // we must not touch the instance, replace properties
    Object.assign(
        currentLanguage,
        merge(
            JSON.parse(JSON.stringify(DEFAULT_LANGUAGE)),
            otherLang,
        ),
    );

    // moment is loaded with all available locales
    moment.locale((currentLanguage as I18NType).id);

    currentLanguage.format = format;
    currentLanguage.pluralize = pluralize;
    currentLanguage.formatDate = formatDate;
    currentLanguage.countryName = countryName((currentLanguage as I18NType).Countries);
}

/**
 * This loads the build-in translations and internationalization options. This method
 * cannot be externalized due to cycling dependencies.
 *
 * @param lang
 */
function loadLanguage(lang: Languages) {
    // tslint:disable: no-var-requires
    if (lang === 'de') {
        replaceCurrentLanguage(require('./translations/de').default);
    } else if (lang === 'fi') {
        replaceCurrentLanguage(require('./translations/fi').default);
    } else if (lang === 'is') {
        replaceCurrentLanguage(require('./translations/is').default);
    } else if (lang === 'nl') {
        replaceCurrentLanguage(require('./translations/nl').default);
    } else {
        // default
        replaceCurrentLanguage({});
    }
}

loadLanguage(getAppLanguage());

// tslint:disable-next-line: export-name
export const I18N: I18NType & {
    format: FormatFunc,
    formatDate: FormatDateFunc,
    pluralize: PluralizeFunc,
    countryName: CountryNameFunc,
} = currentLanguage;
