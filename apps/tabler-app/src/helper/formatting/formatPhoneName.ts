import { I18N } from '../../i18n/translation';

export function formatPhoneName(short: string) {
    switch (short) {
        case 'mobile':
            return I18N.PhoneNames.mobile;
        case 'home':
            return I18N.PhoneNames.home;
        case 'work':
            return I18N.PhoneNames.work;
        case 'other':
            return I18N.PhoneNames.other;
        default:
            return short;
    }
}
