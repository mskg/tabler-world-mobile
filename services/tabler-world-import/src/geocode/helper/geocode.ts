import { addressHash, addressToString, IAddress } from '@mskg/tabler-world-geo';
import { IDataService } from '@mskg/tabler-world-rds-client';
import { getGeocoder, getGeocoderName } from '../implementations/getGeocoder';
import { Result } from '../types/Result';

const geocoder = getGeocoder();

// tslint:disable-next-line: max-func-body-length
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
        const addressQuery = addressToString(address);
        let encoded = await geocoder(address);
        console.debug(md5, 'Result is', encoded);

        let method = '1';

        // otherwise this makes no sense
        if (address.country && address.city) {
            // if line1 and line2 is present, line2 normally contains the street
            if (encoded == null && address.street2 != null) {
                console.debug(md5, '[2]', 'retrying with street2 only');

                const modified = { ...address };
                delete modified.street1;

                // we try again with only line2
                encoded = await geocoder(modified);
                method = '2';

                console.debug(md5, 'Result is', encoded);
            }

            // geocoders sometimes don't know street numbers, we remove it
            if (encoded == null && address.street1) {
                console.debug(md5, '[3]', 'retrying without street number');

                const modified = { ...address };

                if (modified.street2) {
                    modified.street1 = modified.street2;
                    delete modified.street2;
                }

                // @ts-ignore
                modified.street1 = address.street1.replace(/[0-9].*$/g, '').trim();
                encoded = await geocoder(modified);
                method = '3';

                console.debug(md5, 'Result is', encoded);
            }

            // we remove street number and postalcode
            if (encoded == null && address.street1 && address.postal_code) {
                console.debug(md5, '[4]', 'retrying without street number and postalcode');

                const modified = { ...address };
                delete modified.postal_code;

                if (modified.street2) {
                    modified.street1 = modified.street2;
                    delete modified.street2;
                }

                // @ts-ignore
                modified.street1 = address.street1.replace(/[0-9].*$/g, '').trim();
                encoded = await geocoder(modified);
                method = '4';

                console.debug(md5, 'Result is', encoded);
            }

            if (encoded == null && address.postal_code) {
                console.debug(md5, '[5]', 'retrying with city and postalcode');

                const modified = { ...address };
                delete modified.street1;
                delete modified.street2;

                encoded = await geocoder(modified);
                method = '5';

                console.debug(md5, 'Result is', encoded);
            }

            if (encoded == null) {
                console.debug(md5, '[6]', 'retrying with city only');

                const modified = { ...address };
                delete modified.postal_code;
                delete modified.street1;
                delete modified.street2;

                encoded = await geocoder(modified);
                method = '6';

                console.debug(md5, 'Result is', encoded);
            }
        }

        const point = encoded == null
            ? null
            : `POINT(${encoded.longitude} ${encoded.latitude})`;

        console.log(md5, 'storing result', point);

        await client.query(
            'insert into geocodes (hash, query, point, result, modifiedon, provider, method) values ($1, $2, $3, $4, now(), $5, $6)',
            [
                md5,
                addressQuery,
                point,
                encoded ? JSON.stringify(encoded) : null,
                getGeocoderName(),
                point ? method : null,
            ],
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
