import { IAddress } from '@mskg/tabler-world-geo';
import NodeGeocoder from 'node-geocoder';

// tslint:disable-next-line: no-var-requires
const version = require('../../package.json');
// tslint:disable-next-line: no-var-requires
const HttpsAdapter = require('node-geocoder/lib/httpadapter/httpsadapter');

const httpAdapter = new HttpsAdapter(null, {
    headers: {
        'user-agent': process.env.geo_agent + '@' + version.version,
    },
});

const geocoder = NodeGeocoder({
    provider: 'openstreetmap',
    // @ts-ignore
    httpAdapter,
    email: process.env.geo_email,
});

export async function openstreetmap(address: IAddress): Promise<NodeGeocoder.Entry | null> {
    console.log('runGeocode', address);
    const thisops: { [key: string]: string; } = {
        limit: '1',
    };

    if (address.street1) {
        thisops.street = address.street1.trim();
    }

    if (address.street2) {
        thisops.street = thisops.street
            ? thisops.street + ',' + address.street2.trim()
            : address.street2.trim();
    }

    if (address.postal_code) {
        thisops.postalcode = address.postal_code.toString();
    }

    if (address.city) {
        thisops.city = address.city.trim();
    }

    if (address.country) {
        thisops.country = address.country.trim();
    }

    const result = await geocoder.geocode(thisops);
    if (!result || result.length == 0) { return null; }

    return result[0];
}
