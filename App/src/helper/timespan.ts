import { I18N } from '../i18n/translation';

export function timespan(time1: number, time2?: number) {
    if (typeof time2 == 'undefined') {
        time2 = 0;
    }

    let period = Math.abs(time1 - time2) / 1000;

    let timespan = 1;
    let format = 'seconds';

    if (period > 31556926) {
        // More than one year
        format = 'years';
        timespan = Math.floor(period / 31556926);
    } else if (period > 2629744) {
        // More than one month
        format = 'months';
        timespan = Math.floor(period / 2629744);
    } else if (period > 604800) {
        // More than one week
        format = 'weeks';
        timespan = Math.floor(period / 604800);
    } else if (period > 86400) {
        // More than one day
        format = 'days';
        timespan = Math.floor(period / 86400);
    } else if (period > 3600) {
        // More than one hour
        format = 'hours';
        timespan = Math.floor(period / 3600);
    } else if (period > 60) {
        // More than one minute
        format = 'minutes';
        timespan = Math.floor(period / 60);
    }

    // Remove the s
    if (timespan == 1) {
        format = I18N.Timespan.toOne(I18N.Timespan[format]);
    } else {
        format = I18N.Timespan[format];
    }

    return timespan + ' ' + format;
}
