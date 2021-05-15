import { ___DONT_USE_ME_DIRECTLY___COLOR_41I, ___DONT_USE_ME_DIRECTLY___COLOR_LCI, ___DONT_USE_ME_DIRECTLY___COLOR_RTI } from './colors';

export function getFamilyColor(family: 'rti' | 'lci' | 'c41'): string {
    if (family === 'lci') {
        return ___DONT_USE_ME_DIRECTLY___COLOR_LCI;
    }
    if (family === 'c41') {
        return ___DONT_USE_ME_DIRECTLY___COLOR_41I;
    }

    return ___DONT_USE_ME_DIRECTLY___COLOR_RTI;
}
