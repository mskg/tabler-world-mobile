import { I18N } from '../i18n/translation';

export function distance(d: number) {
    let format;
    let result = d;

    if (d >= 1000) {
        format = 'km';
        result = Math.floor(d / 1000);
    } else {
        // More than one month
        format = 'm';
    }

    return result + ' ' + I18N.Distance[format];
}
