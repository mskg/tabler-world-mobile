import NodeGeocoder from "node-geocoder";
import { AsyncThrottle } from "../helper/AsyncThrottle";
import { IAddress } from "./IAddress";

const HttpsAdapter = require('node-geocoder/lib/httpadapter/httpsadapter');
var httpAdapter = new HttpsAdapter(null, {
    headers: {
        'user-agent': 'https://rtionlinevision.com/',
    }
});

const geocoder = NodeGeocoder({
    provider: 'openstreetmap',
    httpAdapter,
});

async function runGecode(address: IAddress): Promise<NodeGeocoder.Entry[]> {
    const thisops: { [key: string]: string } = {
        limit: "1",
    };

    if (address.street1) { thisops.street = address.street1.trim(); }
    if (address.street2) {
        thisops.street = thisops.street
            ? thisops.street + "," + address.street2.trim()
            : address.street2.trim();
    }

    if (address.postal_code) { thisops.postalcode = address.postal_code.toString(); }
    if (address.city) { thisops.city = address.city.trim(); }
    if (address.country) { thisops.country = address.country.trim(); }

    console.log(thisops);
    return await geocoder.geocode(thisops);
}

// compare https://operations.osmfoundation.org/policies/nominatim/
export const geocode = AsyncThrottle(runGecode, 2000, 1);
