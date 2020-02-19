import { IEducation } from '../../model/IEducation';
import { formatAddress } from './formatAddress';

export function formatEducation(edu?: IEducation | null) {
    if (edu == null) {
        return undefined;
    }
    return [
        edu.education,
        edu.school,
        formatAddress(edu.address),
    ].filter(Boolean).join('\n');
}
