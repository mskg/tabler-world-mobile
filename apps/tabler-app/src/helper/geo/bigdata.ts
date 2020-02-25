import { BigDataResult } from '@mskg/tabler-world-geo-bigdata';
import { EarthLocation } from './EarthLocation';
import { logger } from './logger';

export async function bigdata(location: EarthLocation): Promise<BigDataResult | undefined> {
    if (__DEV__) {
        return undefined;
    }

    try {
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.latitude}&longitude=${location.longitude}&localityLanguage=en`;
        logger.debug('bigdata', url);

        const result = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        const col: BigDataResult = await result.json();
        if (result.status !== 200 || col == null) {
            logger.debug('Location', location, 'undefined');
            return undefined;
        }

        logger.debug('Geocoded', location, 'to', col);
        return col;
    } catch (e) {
        logger.log(e, 'Could not geocode using bigdatacloud', location);
    }

    return undefined;
}
