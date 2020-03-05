import moment from 'moment';
import { I18N } from '../../i18n/translation';

export function formatTimespan(time1: number, time2?: number) {
    return moment.duration(Math.abs(time1 - (time2 || 0))).humanize();
}

const toOne = (s: string) => s.substring(0, s.length - 1);
export function formatFullTimespan(time1: number, time2?: number) {
    if (time2 == null) {
        // tslint:disable-next-line: no-parameter-reassignment
        time2 = 0;
    }

    const period = Math.round(Math.abs(time1 - time2) / 1000);

    let ts = period;
    let format = 'seconds';

    if (period > 31556926) {
        // More than one year
        format = 'years';
        ts = Math.floor(period / 31556926);
    } else if (period > 2629744) {
        // More than one month
        format = 'months';
        ts = Math.floor(period / 2629744);
    } else if (period > 604800) {
        // More than one week
        format = 'weeks';
        ts = Math.floor(period / 604800);
    } else if (period > 86400) {
        // More than one day
        format = 'days';
        ts = Math.floor(period / 86400);
    } else if (period > 3600) {
        // More than one hour
        format = 'hours';
        ts = Math.floor(period / 3600);
    } else if (period > 60) {
        // More than one minute
        format = 'minutes';
        ts = Math.floor(period / 60);
    }

    // Remove the s
    if (ts === 1) {
        format = toOne(I18N.Timespan[format]);
    } else {
        format = I18N.Timespan[format];
    }

    return `${ts} ${format}`;
}
