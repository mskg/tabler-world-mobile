import { GeoParameters } from '../types/Geo';

export const Geo: GeoParameters = {
    pollInterval: 10 * 1000,
    reverseGeocodeTimeout: 2 * 1000,
    accuracy: 2, // Location.Accuracy.Low

    // to do 500m in 10 seconds, this means 180 hm/h
    deferredUpdatesInterval: 10 * 1000,
    distanceInterval: 500,

    // ios
    pausesUpdatesAutomatically: false,
};
