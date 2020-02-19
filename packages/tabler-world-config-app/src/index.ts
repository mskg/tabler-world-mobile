import { Fetch } from './defaults/Fetch';
import { Geo } from './defaults/Geo';
import { Geocoding } from './defaults/Geocoding';
import { Timeouts } from './defaults/Timeouts';
import { Urls } from './defaults/Urls';

export * from './types/Fetch';
export * from './types/Geo';
export * from './types/Geocoding';
export * from './types/Timeouts';
export * from './types/Urls';

// tslint:disable-next-line: export-name
export const defaultParameters = {
    geo: Geo,
    fetch: Fetch,
    timeouts: Timeouts,
    urls: Urls,
    geocoding: Geocoding,
};
