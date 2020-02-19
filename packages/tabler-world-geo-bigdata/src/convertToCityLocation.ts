import { filter, maxBy } from 'lodash';
import { BigDataResult } from './BigDataResult';
import { GeoCityLocation } from './GeoCityLocation';
import { Preferences } from './Preferences';

export function convertToCityLocation(result: BigDataResult, preferences?: Preferences): GeoCityLocation {
    let name = result.locality || result.principalSubdivision || result.countryName || result.continent;
    const preference = result.countryCode && preferences
        ? preferences[result.countryCode.toUpperCase()]?.preferLevel
        : undefined;

    if (preference) {
        const found = maxBy(
            filter(result.localityInfo.administrative, (l) => l.adminLevel < preference),
            (l) => l.adminLevel,
        );

        name = found?.name ?? name;
    }

    return {
        name,
        country: result.countryCode || result.continent,
    };
}
