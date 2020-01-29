import { IAddress } from './IAddress';

export function enrichAddress(addr: IAddress, country: string) {
    if (country == null) { return addr; }

    if (addr.country == null || addr.country.trim() === '') {
        addr.country = country;
    }

    return addr;
}
