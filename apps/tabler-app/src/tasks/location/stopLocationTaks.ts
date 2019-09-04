import * as Location from 'expo-location';
import { LOCATION_TASK_NAME } from '../Constants';
import { logger } from './logger';

export async function stopLocationTaks() {
    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (started) {
      logger.log('Stopping task', LOCATION_TASK_NAME);
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
}
