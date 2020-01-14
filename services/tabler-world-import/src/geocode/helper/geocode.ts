import { AsyncThrottle } from '@mskg/tabler-world-common';
import { addressHash, addressToString, IAddress } from '@mskg/tabler-world-geo';
import { IDataService } from '@mskg/tabler-world-rds-client';
import { komoot } from '../implementations/komoot';
import { Result } from '../types/Result';

const throtteledGeoImplementation = AsyncThrottle(komoot, 1500, 1);

export async function geocode(client: IDataService, address: IAddress): Promise<Result | undefined> {
    const md5 = addressHash(address);
    if (md5 == null) {
        console.log(address, 'is not valid');
        return undefined;
    }

    console.debug(md5, 'Encoding', address);

    const res = await client.query(
        `
select
    ST_X (point::geometry) AS longitude,
    ST_Y (point::geometry) AS latitude
from geocodes where hash = $1`,
        [md5],
    );

    if (res.rows.length !== 1) {
        const hash = addressToString(address);
        let encoded = await throtteledGeoImplementation(address);
        console.debug(md5, 'Result is', encoded);

        if (encoded == null && address.street2 != null) {
            console.debug(md5, 'No result found, retrying');

            // we try again with only line2
            delete address.street1;
            encoded = await throtteledGeoImplementation(address);

            console.debug(md5, 'Result is', encoded);
        }

        const point = encoded == null
            ? null
            : `POINT(${encoded.longitude} ${encoded.latitude})`;

        console.log(md5, 'storing result', point);

        await client.query(
            'insert into geocodes (hash, query, point, result, modifiedon) values ($1, $2, $3, $4, now())',
            [md5, hash, point, encoded ? JSON.stringify(encoded) : null],
        );

        return encoded == null
            ? undefined
            : {
                longitude: encoded.longitude as number,
                latitude: encoded.latitude as number,
            };
    }
    console.debug(md5, 'Found cached result');
    return res.rows[0] as Result;

}
