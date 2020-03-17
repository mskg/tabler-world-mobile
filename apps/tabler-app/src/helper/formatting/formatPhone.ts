import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

export function formatPhone(text: string, country: string) {
    // @ts-ignore
    const nbr = parsePhoneNumberFromString(text, country.toUpperCase());
    const t = nbr?.getType();

    const mobile = !t || t === 'FIXED_LINE_OR_MOBILE' || t === 'MOBILE';

    return !nbr || !nbr.isValid()
        ? { mobile, value: text }
        : { mobile, value: nbr.formatInternational() };
}
