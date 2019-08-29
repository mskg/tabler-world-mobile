import { addressToString } from "./addressToString";
import { IAddress } from "./IAddress";
import { hash } from "./hash";

export function addressHash(address: IAddress): string | null {
    if (address == null) return null;

    const str = addressToString(address);
    if (str == null) return null;

    return hash(str);
}