import { I18N } from '../../i18n/translation';

export function formatEMailName(short: string) {
    switch (short) {
        case 'rt':
            return I18N.EMailNames.rt;
        case 'home':
            return I18N.EMailNames.home;
        case 'work':
            return I18N.EMailNames.work;
        case 'other':
            return I18N.EMailNames.other;
        default:
            return short;
    }
}
