import * as Location from 'expo-location';
import { Feature, FeatureCollection } from 'geojson';
import _ from 'lodash';
import deStrings from '../../i18n/translations/de_strings.json';
import { EarthLocation } from './EarthLocation';
import { logger } from './logger.js';

const countriesByISO = _(deStrings.Countries).entries().reduce(
    (p, c) => {
        p[c[1].toUpperCase()] = c[0];
        return p;
    },
    {},
);

export async function photon(location: EarthLocation): Promise<Location.Address & {
    isoCountryCode?: string;
} | undefined> {
    try {
        const url = `https://photon.komoot.de/reverse?lon=${location.longitude}&lat=${location.latitude}&lang=de&limit=1`;
        logger.debug('photon', url);

        const result = await fetch(url, {
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

        const isoCountryCode = countriesByISO[(props.country || '').toUpperCase()];
        return {
            name: props.name,
            street: props.street || props.name + (props.housenumber ? ` ${props.housenumber}` : ''),
            postalCode: props.postcode,
            city: props.city,
            region: props.state,
            isoCountryCode: isoCountryCode !== '' ? isoCountryCode : undefined,
            country: props.country,
        };

    } catch (e) {
        // too much traffic
        logger.log(e, 'Could not geocode using photon', location);
    }

    return undefined;
}
