import { GeoParameters } from '@mskg/tabler-world-config-app';
import * as Location from 'expo-location';
import { AppState, Platform } from 'react-native';
import { ParameterName } from '../../model/graphql/globalTypes';
import { getParameterValue } from '../parameters/getParameterValue';
import { EarthLocation } from './EarthLocation';
import { logger } from './logger';
import { timeout } from './timeout';

export async function location(loc: EarthLocation): Promise<Location.Address | undefined> {
    // geocoding not allowed in background state
    // https://developer.apple.com/documentation/corelocation/clgeocoder

    if (AppState.currentState !== 'background' || Platform.OS === 'android') {
        try {
            const params = await getParameterValue<GeoParameters>(ParameterName.geo);

            // might fail if no key on android
            const coded = await timeout(
                params.reverseGeocodeTimeout,
                Location.reverseGeocodeAsync(loc),
            );

            const address = coded && coded.length > 0 ? coded[0] : undefined;
            if (address && address.city == null) {
                return undefined;
            }

            return address;
        } catch (e) {
            // too much traffic
            logger.log(e, 'Could not geocode using Location', location);
        }
    }

    return undefined;
}
