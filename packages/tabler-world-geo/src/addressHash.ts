import { addressToString } from './addressToString';
import { hash } from './hash';
import { IAddress } from './IAddress';

export function addressHash(address: IAddress): string | null {
    if (address == null) { return null; }

    const str = addressToString(address);
    if (str == null) { return null; }

    return hash(str);
}
