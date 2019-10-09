import * as Location from 'expo-location';

interface ILocationTaskOptions {
    accuracy?: Location.Accuracy;
    timeInterval?: number;
    distanceInterval?: number;
    showsBackgroundLocationIndicator?: boolean;
    deferredUpdatesDistance?: number;
    deferredUpdatesTimeout?: number;
    deferredUpdatesInterval?: number;
    activityType?: Location.ActivityType;
    pausesUpdatesAutomatically?: boolean;
    foregroundService?: {
        notificationTitle: string;
        notificationBody: string;
        notificationColor?: string;
    };
}

export type GeoParameters = {
    pollInterval: number,
    reverseGeocodeTimeout: number,
} & ILocationTaskOptions;

// https://docs.expo.io/versions/latest/sdk/location/
export const GeoParametersDefaults: GeoParameters = {
    pollInterval: 10 * 1000, // ms
    reverseGeocodeTimeout: 10 * 1000, // ms

    accuracy: Location.Accuracy.Low,
    distanceInterval: 500,
    pausesUpdatesAutomatically: false,
};
