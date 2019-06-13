import { IBankAccount } from '../model/IMember';

export function formatBank(address: IBankAccount | undefined) {
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
