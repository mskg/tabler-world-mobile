import { GeoParameters, LocationAccuracy, LocationActivityType } from '../types/Geo';

export const Geo: GeoParameters = {
    android: {
        accuracy: LocationAccuracy.Balanced,

        // only every 10 seconds, 500m minimum
        timeInterval: 10 * 1000,
        distanceInterval: 500,
    },

    ios: {
        accuracy: LocationAccuracy.Low,

        // only every 10 seconds, 500m minimum
        timeInterval: 10 * 1000,
        distanceInterval: 500,

        // iOS
        pausesUpdatesAutomatically: false,
        activityType: LocationActivityType.Other,
    },

    pollInterval: 10 * 1000,
    reverseGeocodeTimeout: 2 * 1000,
};
