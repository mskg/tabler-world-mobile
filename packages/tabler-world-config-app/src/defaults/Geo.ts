import { GeoParameters } from '../types/Geo';

export const Geo: GeoParameters = {
    pollInterval: 10 * 1000,
    reverseGeocodeTimeout: 2 * 1000,
    accuracy: 2, // Location.Accuracy.Low
    distanceInterval: 500,
    pausesUpdatesAutomatically: false,
};
