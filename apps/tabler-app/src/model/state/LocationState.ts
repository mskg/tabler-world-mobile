import * as Location from 'expo-location';
import { NearbyMembers_nearbyMembers } from '../graphql/NearbyMembers';

export type LocationState = {
    timestamp?: number,
    location?: Location.LocationData ,
    address?: Location.Address,
    nearbyMembers?: NearbyMembers_nearbyMembers[],
};
