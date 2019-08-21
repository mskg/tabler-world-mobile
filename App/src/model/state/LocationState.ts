import * as Location from 'expo-location';
import { LocationData } from 'expo-location';

export type LocationState = {
  timestamp?: number,
  location?: LocationData,
  address?: Location.Address,
};
