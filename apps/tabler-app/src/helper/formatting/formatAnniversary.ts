import moment from 'moment';
import { I18N } from '../../i18n/translation';

export function formatAnniversary(date?: string) {
    if (date == null) return undefined;

    const mt = moment(date);
    return `${mt.format(I18N.Date.date)} (${Math.abs(mt.diff(Date.now(), 'years'))})`;
}
