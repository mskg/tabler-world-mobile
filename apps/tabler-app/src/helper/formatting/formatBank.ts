import { IBankAccount } from '../../model/IBankAccount';

export function formatBank(address?: IBankAccount | null) {
    if (address == null) {
        return undefined;
    }
    return [
        address.owner,
        address.name,
        address.iban,
        address.bic,
    ].filter(Boolean).join('\n');
}
