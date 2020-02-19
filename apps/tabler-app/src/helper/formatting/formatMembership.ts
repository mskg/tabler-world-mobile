import moment from 'moment';

export function formatMembership(date?: string) {
    if (date == null) return undefined;

    const mt = moment(date);
    return `${mt.format('YYYY')} (${new Date().getFullYear() - mt.toDate().getFullYear() + 1})`;
}
