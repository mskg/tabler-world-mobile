import { IAddress } from "./IAddress";

export function addressToString(address: IAddress): string | null {
    // we cannot encode that
    if (address.city == null && address.postal_code == null) {
        return null;
    }

    const fields = [
        address.street1,
        address.street2,
        address.postal_code ? address.postal_code.toString() : undefined,
        address.city,
        address.country
    ]
    .map((a) => a ? a.trim() : undefined)
    .filter((a) => a && a !== "")

    return fields.length == 0 ? null : fields.join(",");
}