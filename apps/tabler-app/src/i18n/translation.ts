
import * as Localization from 'expo-localization';
import _ from 'lodash';
import de from './de';
import en, { I18NType } from './en';

let res = en;
if (Localization.locale.toLocaleLowerCase().startsWith('de')) {
    res = _.merge(en, de);
}

export const I18N: I18NType = res;
