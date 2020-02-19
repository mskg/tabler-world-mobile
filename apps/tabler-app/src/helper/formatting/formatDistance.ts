import { I18N } from '../../i18n/translation';

export function formatDistance(d: number) {
    let format: 'km' | 'm';
    let result = d;

    if (d >= 1000) {
        format = 'km';
        result = Math.floor(d / 1000);
    } else {
        // More than one month
        format = 'm';
    }

    return `${result} ${I18N.Distance[format]}`;
}
