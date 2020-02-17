
import _ from 'lodash';
import moment from 'moment';
import { Categories, Logger } from '../helper/Logger';
import { countryName, CountryNameFunc } from './countryName';
import { format, FormatFunc } from './format';
import { formatDate, FormatDateFunc } from './formatDate';
import { getAppLanguage } from './getAppLanguage';
import { I18NType } from './I18NType';
import { pluralize, PluralizeFunc } from './pluralize';
import DEFAULT_LANGUAGE from './translations/defaultLanguage';
import { loadLanguage } from './translations/loadLanguage';

const logger = new Logger(Categories.App);

const currentLanguage: any = {};
export function replaceCurrentLanguage(otherLang: any) {
    logger.log('replaceCurrentLanguage', otherLang.id);

    // we must not touch the instance, replace properties
    Object.assign(
        currentLanguage,
        _.merge(
            // deep clone en
            JSON.parse(JSON.stringify(DEFAULT_LANGUAGE)),
            otherLang,
        ),
    );

    moment.locale((currentLanguage as I18NType).id);

    currentLanguage.format = format;
    currentLanguage.pluralize = pluralize;
    currentLanguage.formatDate = formatDate;
    currentLanguage.countryName = countryName((currentLanguage as I18NType).Countries);
}

loadLanguage(getAppLanguage());

// tslint:disable-next-line: export-name
export const I18N: I18NType & {
    format: FormatFunc,
    formatDate: FormatDateFunc,
    pluralize: PluralizeFunc,
    countryName: CountryNameFunc,
} = currentLanguage;
