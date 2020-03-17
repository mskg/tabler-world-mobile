import moment from 'moment';

export function formatTimeAgo(time1: string | number) {
    const period = Math.abs(Date.now() - new Date(time1).valueOf()) / 1000;

    // more than one week
    if (period > 604800) {
        return moment(time1).format('L');
    }

    // days
    if (period > 86400) {
        return moment(time1).format('dddd');
    }

    // hours
    return moment(time1).format('HH:mm');
}
