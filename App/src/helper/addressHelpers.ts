import { Platform } from 'react-native';
import { I18N } from '../i18n/translation';
import { IAddress, ICompany, IEducation } from '../model/IMember';
import { OpenLink } from './OpenLink';

export function formatAddress(address: IAddress | undefined) {
    if (address == null) { return undefined; }

    return [
        address.street1,
        address.street2,
        address.postal_code != null && address.postal_code != ""
            && address.city != null && address.city != ""
            ? address.postal_code + " " + address.city
            : null,
        address.country = I18N.Countries.translate(address.country),
    ].filter(Boolean).join('\n');
}

export function formatEducation(edu: IEducation | undefined) {
    if (edu == null) { return undefined; }

    return [
        edu.education,
        edu.school,
        formatAddress(edu.address),
    ].filter(Boolean).join('\n');
}

export function formatCompany(company: ICompany | undefined) {
    if (company == null) { return undefined; }

    return [
        company.name,
        company.function,
        formatAddress(company.address),
    ].filter(Boolean).join('\n');
}

const isNullOrEmpty = (s) => s == null || s === "";

export function formatRoutableAddress(address: IAddress | undefined) {
    if (address == null) { return undefined; }
    if (isNullOrEmpty(address.street1) && isNullOrEmpty(address.street2)) { return undefined; }
    if (isNullOrEmpty(address.city) && isNullOrEmpty(address.postal_code)) { return undefined; }

    return [
        address.street1,
        address.street2,
        address.postal_code != null && address.postal_code != ""
            && address.city != null && address.city != ""
            ? address.postal_code + " " + address.city
            : null,
        address.country = I18N.Countries.translate(address.country),
    ].filter(Boolean).join(',');
}

export function showAddress(address?: IAddress) {
    const addr = formatRoutableAddress(address);
    if (addr == null) return;

    // needs rework #30
    const url = Platform.OS == "ios"
     ? "http://maps.apple.com/?q="
     : "https://www.google.com/maps/search/?api=1&query="

    OpenLink.url(url + encodeURIComponent(addr));
}
