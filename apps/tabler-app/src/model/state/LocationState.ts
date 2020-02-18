import * as Location from 'expo-location';
import { NearbyMembers_nearbyMembers } from '../graphql/NearbyMembers';
import { GeoCityLocation } from '../GeoCityLocation';

export type LocationState = {
    timestamp?: number,
    location?: Location.LocationData ,
    address?: GeoCityLocation,
    nearbyMembers?: NearbyMembers_nearbyMembers[],
};
