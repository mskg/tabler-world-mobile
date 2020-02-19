import { I18N } from '../../i18n/translation';
import { IAddress } from '../../model/IAddress';

export function formatAddress(address?: IAddress | null) {
    if (address == null) {
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
    ].filter(Boolean).join('\n');
}
