import { I18N } from '../../i18n/translation';
import { IAddress } from '../../model/IAddress';

// tslint:disable: prefer-template
export function formatAddress(address?: IAddress | null) {
    if (address == null) {
        return undefined;
    }

    return [
        address.street1,
        address.street2,
        ((address.postal_code || '') + ' ' + (address.city || '')).trim(),
        address.country
            ? I18N.countryName(address.country)
            : null,
    ]
        .map((s) => s === '' ? null : s)
        .filter(Boolean).join('\n');
}
