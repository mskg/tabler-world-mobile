import { AsyncThrottle } from '@mskg/tabler-world-common';
import { IAddress } from '@mskg/tabler-world-geo';
import NodeGeocoder from 'node-geocoder';
import { komoot } from './komoot';
import { nullCoder } from './nullCoder';
import { openstreetmap } from './openstreetmap';

type geocoderFunction = (address: IAddress) => Promise<NodeGeocoder.Entry | null>;

export function getGeocoderName() {
    return process.env.geocoder_implementation || 'komoot';
}

export function getGeocoder(): geocoderFunction {
    const throttle = parseInt(process.env.geocoder_throttle || '1500', 10);
    const implementation = getGeocoderName();

    if (implementation === 'openstreetmap') {
        return AsyncThrottle(openstreetmap, throttle, 1);
    }

    if (implementation === 'null') {
        return nullCoder;
    }

    return AsyncThrottle(komoot, throttle, 1);
}
