import { I18N } from '../../i18n/translation';
import { IAddress } from '../../model/IAddress';

const isNullOrEmpty = (s) => s == null || s === '';

export function formatRoutableAddress(address?: IAddress | null) {
    if (address == null) {
        return undefined;
    }
    if (isNullOrEmpty(address.street1) && isNullOrEmpty(address.street2)) {
        return undefined;
    }
    if (isNullOrEmpty(address.city) && isNullOrEmpty(address.postal_code)) {
        return undefined;
    }
    return [
        address.street1,
        address.street2,
        address.postal_code != null && address.postal_code != ''
            && address.city != null && address.city != ''
            ? address.postal_code + ' ' + address.city
            : null,
        address.country = I18N.countryName(address.country),
    ].filter(Boolean).join(',');
}
