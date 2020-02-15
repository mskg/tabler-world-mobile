import * as Location from 'expo-location';
import { Feature, FeatureCollection } from 'geojson';
import _ from 'lodash';
import { AppState, Platform } from 'react-native';
import deCountries from '../../i18n/translations/de';
import { ParameterName } from '../../model/graphql/globalTypes';
import { Categories, Logger } from '../Logger';
import { GeoParameters } from '../parameters/Geo';
import { getParameterValue } from '../parameters/getParameterValue';
import { timeout } from './timeout';

export const logger = new Logger(Categories.Helpers.Geo);

type EarthLocation = {
    latitude: number,
    longitude: number,
};

export async function reverseGeocode(location: EarthLocation): Promise<Location.Address | undefined> {
    let address: Location.Address & { isoCountryCode?: string } | undefined;
    let backup: Location.Address & { isoCountryCode?: string } | undefined;

    try {
        // geocoding not allowed in background state
        // https://developer.apple.com/documentation/corelocation/clgeocoder
        if (AppState.currentState !== 'background' || Platform.OS === 'android') {
            try {
                const params = await getParameterValue<GeoParameters>(ParameterName.geo);

                // might fail if no key on android
                const coded = await timeout(
                    params.reverseGeocodeTimeout,
                    Location.reverseGeocodeAsync(location),
                );

                address = coded && coded.length > 0 ? coded[0] : undefined;

                if (address && address.city == null) {
                    backup = address;
                    address = undefined;
                }
            } catch (e) {
                // too much traffic
                logger.log(e, 'could not geocode using Location', location);
            }
        }

        // fallback to photon
        if (address == null) {
            address = await photon(location);
        }

        const result = address || backup;
        if (result) {
            logger.log('Geocoded', location, 'to', result);

            if (result.isoCountryCode) {
                result.country = result.isoCountryCode;
            }
        }

        return result;
    } catch (e) {
        // too much traffic
        logger.log(e, 'could not geocode', location);
    }

    return undefined;
}

const reversed = _(deCountries.Countries).entries().reduce(
    (p, c) => {
        p[c[1].toUpperCase()] = c[0];
        return p;
    },
    {},
);

async function photon(location: EarthLocation): Promise<Location.Address & { isoCountryCode?: string } | undefined> {
    const result = await fetch(`https://photon.komoot.de/reverse?lon=${location.longitude}&lat=${location.latitude}&lang=de&limit=1`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });

    const col: FeatureCollection = await result.json();
    if (col == null || col.features == null || col.features.length === 0) {
        return undefined;
    }

    const feature: Feature = col.features[0];
    const props = feature.properties || {};
    logger.debug('Geocoded', 'to', props);

    const isoCountryCode = reversed[(props.country || '').toUpperCase()];

    return {
        name: props.name,
        street: props.street || props.name + (props.housenumber ? ` ${props.housenumber}` : ''),
        postalCode: props.postcode,
        city: props.city,
        region: props.state,
        isoCountryCode: isoCountryCode !== '' ? isoCountryCode : undefined,
        country: props.country,
    };
}
