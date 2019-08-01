import { Client } from "pg";
import { addressHash } from "./addressHash";
import { addressToString } from "./addressToString";
import { geocode } from "./geocode";
import { IAddress } from "./IAddress";

type Result = {
    longitude: number,
    latitude: number,
}

export async function encode(client: Client, address: IAddress): Promise<Result | undefined> {
    const md5 = addressHash(address);
    if (md5 == null) return;

    console.log("Working on", address, md5);

    const res = await client.query(`
select
    ST_X (point::geometry) AS longitude,
    ST_Y (point::geometry) AS latitude
from geocodes where hash = $1`,
        [md5]);

    if (res.rows.length !== 1) {
        const hash = addressToString(address);
        let encoded = await geocode(address);
        console.log("Result is", encoded);

        if (encoded.length == 0 && address.street2 != null) {
            console.log("Retrying");

            // we try again with only line2
            delete address.street1;
            encoded = await geocode(address);

            console.log("Result is", encoded);
        }

        const point = encoded.length == 0
            ? null
            : `POINT(${encoded[0].longitude} ${encoded[0].latitude})`;

        await client.query(
            'insert into geocodes (hash, query, point, modifiedon) values ($1, $2, $3, now())',
            [md5, hash, point]
        );

        return encoded.length == 0 ? undefined : {
            longitude: encoded[0].longitude as number,
            latitude: encoded[0].latitude as number,
        };
    } else {
        return res.rows[0] as Result;
    }
}