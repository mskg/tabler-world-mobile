import { AsyncThrottle } from "@mskg/tabler-world-common";
import { IDataService } from "@mskg/tabler-world-rds";
import { addressHash } from "./addressHash";
import { addressToString } from "./addressToString";
import { IAddress } from "./IAddress";
import { photonImpl } from "./implementations/Komoot";

type Result = {
    longitude: number,
    latitude: number,
}

const geocode = AsyncThrottle(photonImpl, 1500, 1);

export async function encode(client: IDataService, address: IAddress): Promise<Result | undefined> {
    const md5 = addressHash(address);
    if (md5 == null) {
        console.log(address, "is not valid");
        return undefined;
    };

    console.debug(md5, "Encoding", address);

    const res = await client.query(`
select
    ST_X (point::geometry) AS longitude,
    ST_Y (point::geometry) AS latitude
from geocodes where hash = $1`,
        [md5]);

    if (res.rows.length !== 1) {
        const hash = addressToString(address);
        let encoded = await geocode(address);
        console.debug(md5, "Result is", encoded);

        if (encoded == null && address.street2 != null) {
            console.debug(md5, "No result found, retrying");

            // we try again with only line2
            delete address.street1;
            encoded = await geocode(address);

            console.debug(md5, "Result is", encoded);
        }

        const point = encoded == null
            ? null
            : `POINT(${encoded.longitude} ${encoded.latitude})`;

        console.log(md5, "storing result", point);

        await client.query(
            'insert into geocodes (hash, query, point, result, modifiedon) values ($1, $2, $3, $4, now())',
            [md5, hash, point, encoded ? JSON.stringify(encoded) : null]
        );

        return encoded == null
            ? undefined
            : {
                longitude: encoded.longitude as number,
                latitude: encoded.latitude as number,
            };
    } else {
        console.debug(md5, "Found cached result");
        return res.rows[0] as Result;
    }
}