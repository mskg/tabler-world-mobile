
import * as Localization from 'expo-localization';
import de from './de';
import en, { I18NType } from "./en";
import _ from 'lodash';

let res = en;
if (Localization.locale.toLocaleLowerCase().startsWith("de")) {
    res = _.merge(en, de);
}

export const I18N: I18NType = res;