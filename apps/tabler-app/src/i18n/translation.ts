
import * as Localization from 'expo-localization';
import _ from 'lodash';
import moment from 'moment';
import { countryName, CountryNameFunc } from './countryName';
import { format, FormatFunc } from './format';
import { formatDate, FormatDateFunc } from './formatDate';
import { I18NType } from './I18NType';
import { pluralize, PluralizeFunc } from './pluralize';
import en from './translations/en';

let res: any = en;

if (Localization.locale.toLocaleLowerCase().startsWith('de')) {
    // tslint:disable-next-line: no-var-requires
    const de = require('./translations/de').default;
    res = _.merge(en, de);
} else if (Localization.locale.toLocaleLowerCase().startsWith('fi')) {
    // tslint:disable-next-line: no-var-requires
    const fi = require('./translations/fi').default;
    res = _.merge(en, fi);
} else if (Localization.locale.toLocaleLowerCase().startsWith('is')) {
    // tslint:disable-next-line: no-var-requires
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
