
import * as Localization from 'expo-localization';
import _ from 'lodash';
import en, { I18NType } from './en';

let res = en;
if (Localization.locale.toLocaleLowerCase().startsWith('de')) {
    // tslint:disable-next-line: no-var-requires
    const de = require('./de').default;
    res = _.merge(en, de);
}

res.init();

// tslint:disable-next-line: export-name
export const I18N: I18NType = res;
