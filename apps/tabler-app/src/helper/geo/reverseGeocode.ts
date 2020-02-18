import { GeocodingParameters, GeoParameters } from '@mskg/tabler-world-config-app';
import { BigDataResult, convertToCityLocation } from '@mskg/tabler-world-geo-bigdata';
import { GeoCityLocation } from '../../model/GeoCityLocation';
import { ParameterName } from '../../model/graphql/globalTypes';
import { getParameterValue } from '../parameters/getParameterValue';
import { bigdata } from './bigdata';
import { EarthLocation } from './EarthLocation';
import { logger } from './logger';
import { timeout } from './timeout';

type Result<T> = {
    raw: T,
    address: GeoCityLocation,
};

export async function reverseGeocode(location: EarthLocation): Promise<Result<BigDataResult> | undefined> {
    try {
        const geoParams = await getParameterValue<GeoParameters>(ParameterName.geo);
        const geocodingParams = await getParameterValue<GeocodingParameters>(ParameterName.geocoding);

        const result = await timeout(
            geoParams.reverseGeocodeTimeout,
            bigdata(location),
        );

        return result
            ? {
                raw: result,
                address: convertToCityLocation(result, geocodingParams.bigData),
            }
            : undefined;

    } catch (e) {
        // too much traffic
        logger.log(e, 'could not geocode', location);
    }

    return undefined;
}


