import moment from 'moment';

export function formatTimespan(time1: number, time2?: number) {
    return moment.duration(Math.abs(time1 - (time2 || 0))).humanize();
}
