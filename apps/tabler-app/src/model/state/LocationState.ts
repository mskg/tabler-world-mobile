import { LocationObject } from 'expo-location';
import { GeoCityLocation } from '../GeoCityLocation';
import { NearbyMembers_nearbyMembers } from '../graphql/NearbyMembers';

export type LocationState = {
    throttleUntil?: number,
    timestamp?: number,

    pending?: boolean,
    location?: LocationObject ,
    address?: GeoCityLocation,

    nearbyMembers?: NearbyMembers_nearbyMembers[],
};
