import { ICompany } from '../../model/ICompany';
import { formatAddress } from './formatAddress';

export function formatCompany(company?: ICompany | null) {
    if (company == null) {
        return undefined;
    }
    return [
        company.name,
        company.function,
        formatAddress(company.address),
    ].filter(Boolean).join('\n');
}
