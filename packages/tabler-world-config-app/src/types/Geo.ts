
export enum LocationAccuracy {
    Lowest = 1,
    Low = 2,
    Balanced = 3,
    High = 4,
    Highest = 5,
    BestForNavigation = 6,
}

export enum LocationActivityType {
    Other = 1,
    AutomotiveNavigation = 2,
    Fitness = 3,
    OtherNavigation = 4,
    Airborne = 5,
}

interface ILocationTaskOptions {
    accuracy?: LocationAccuracy;
    timeInterval?: number;
    distanceInterval?: number;
    showsBackgroundLocationIndicator?: boolean;
    deferredUpdatesDistance?: number;
    deferredUpdatesTimeout?: number;
    deferredUpdatesInterval?: number;
    activityType?: LocationActivityType;
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


