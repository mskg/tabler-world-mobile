import * as Location from 'expo-location';
import { LocationData } from 'expo-location';
import { createAction } from './action';

export const setLocation = createAction<'@@location/track/setLocation', {
  location: LocationData,
  address: Location.Address,
}>(
  '@@location/track/setLocation'
);
