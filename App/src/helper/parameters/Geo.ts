import * as Location from "expo-location";

export type GeoParameters = {
    timeInterval: number,
    distanceInterval: number,
    pausesUpdatesAutomatically: boolean,
    mayShowUserSettingsDialog: boolean,
    accuracy: number,
    pollInterval: number,
}

export const GeoParametersDefaults: GeoParameters = {
    accuracy: Location.Accuracy.Low,
    timeInterval: 15 * 60 * 1000, // ms
    distanceInterval: 1000, // m
    pausesUpdatesAutomatically: true,
    mayShowUserSettingsDialog: false,
    pollInterval: 10*1000 // ms
};