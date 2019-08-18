import * as Location from "expo-location";

interface LocationTaskOptions {
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
} & LocationTaskOptions;

// https://docs.expo.io/versions/latest/sdk/location/
export const GeoParametersDefaults: GeoParameters = {
    accuracy: Location.Accuracy.Low,
    pollInterval: 10*1000, // ms

    distanceInterval: 500,
    deferredUpdatesInterval:
        __DEV__
            ? 15 * 1000
            : 15 * 60 * 1000,
};
