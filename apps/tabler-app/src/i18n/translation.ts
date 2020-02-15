
import * as Localization from 'expo-localization';
import _ from 'lodash';
import moment from 'moment';
import { Categories, Logger } from '../helper/Logger';
import { countryName, CountryNameFunc } from './countryName';
import { format, FormatFunc } from './format';
import { formatDate, FormatDateFunc } from './formatDate';
import { I18NType } from './I18NType';
import { pluralize, PluralizeFunc } from './pluralize';
import en from './translations/en';

const logger = new Logger(Categories.App);

// we need to add internal information to en
// this is not part of the export
{
    // @ts-ignore
    en.id = 'en';

    // @ts-ignore
    en.NavigationStyle = {
        fontSize: 12,
        textAlign: 'center',
        backgroundColor: 'transparent',
    };
}

let DEBUG_LANGUAGE: any;
if (!__DEV__) {
    // be sure about that
    DEBUG_LANGUAGE = null;
}

const LANGUAGE = DEBUG_LANGUAGE ?? Localization.locale.toLocaleLowerCase();

const currentLanguage: any = {};
export function assignLanguage(otherLang: any) {
    logger.log('assignLanguage', otherLang.id);

    // we must not touch the instance, replace properties
    Object.assign(
        currentLanguage,
        _.merge(
            // deep clone en
            JSON.parse(JSON.stringify(en)),
            otherLang,
        ),
    );

    moment.locale((currentLanguage as I18NType).id);

    currentLanguage.format = format;
    currentLanguage.pluralize = pluralize;
    currentLanguage.formatDate = formatDate;
    currentLanguage.countryName = countryName((currentLanguage as I18NType).Countries);
}

export function loadLanguage(lang: string) {
    logger.log('loadLanguage', lang);

    // tslint:disable: no-var-requires
    if (lang.startsWith('de')) {
        assignLanguage(require('./translations/de').default);
    } else if (lang.startsWith('fi')) {
        assignLanguage(require('./translations/fi').default);
    } else if (lang.startsWith('is')) {
        assignLanguage(require('./translations/is').default);
    } else {
        // default
        assignLanguage({});
    }
}

loadLanguage(LANGUAGE);

// tslint:disable-next-line: export-name
export const I18N: I18NType & {
    format: FormatFunc,
    formatDate: FormatDateFunc,
    pluralize: PluralizeFunc,
    countryName: CountryNameFunc,
} = currentLanguage;
