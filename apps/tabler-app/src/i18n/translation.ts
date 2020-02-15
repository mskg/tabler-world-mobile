
import * as Localization from 'expo-localization';
import _ from 'lodash';
import moment from 'moment';
import { countryName, CountryNameFunc } from './countryName';
import { format, FormatFunc } from './format';
import { formatDate, FormatDateFunc } from './formatDate';
import { I18NType } from './I18NType';
import { pluralize, PluralizeFunc } from './pluralize';
import en from './translations/en';

let DEBUG_LANGUAGE: any;
if (!__DEV__) {
    // be sure about that
    DEBUG_LANGUAGE = null;
}

const LANGUAGE = DEBUG_LANGUAGE ?? Localization.locale.toLocaleLowerCase();

let res: any = en;

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

// tslint:disable: no-var-requires
if (LANGUAGE.startsWith('de')) {
    const de = require('./translations/de').default;
    res = _.merge(en, de);
} else if (LANGUAGE.startsWith('fi')) {
    const fi = require('./translations/fi').default;
    res = _.merge(en, fi);
} else if (LANGUAGE.startsWith('is')) {
    const is = require('./translations/is').default;
    res = _.merge(en, is);
}

moment.locale((res as I18NType).id);

res.format = format;
res.pluralize = pluralize;
res.formatDate = formatDate;
res.countryName = countryName((res as I18NType).Countries);

// tslint:disable-next-line: export-name
export const I18N: I18NType & {
    format: FormatFunc,
    formatDate: FormatDateFunc,
    pluralize: PluralizeFunc,
    countryName: CountryNameFunc,
} = res;
