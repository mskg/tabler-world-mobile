import crypto from "crypto";
import { addressToString } from "./addressToString";
import { IAddress } from "./IAddress";

function hash(address: string) {
    return crypto
        .createHash('md5')
        .update(address.toLocaleLowerCase())
        .digest("hex");
}

export function addressHash(address: IAddress): string | null {
    if (address == null) return null;

    const str = addressToString(address);
    if (str == null) return null;

    return hash(str);
}