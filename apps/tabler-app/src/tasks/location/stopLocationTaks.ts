import AsyncStorage from '@react-native-community/async-storage';
import * as Location from 'expo-location';
import { LOCATION_TASK_NAME } from '../Constants';
import { logger } from './logger';

export async function stopLocationTaks() {
    let started = false;

    try {
        started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    } catch (e) {
        if (e.code === 'E_LOCATION_BACKGROUND_UNAUTHORIZED') {
            started = false;
        }
    }

    await AsyncStorage.removeItem(LOCATION_TASK_NAME);

    if (started) {
        logger.log('Stopping task', LOCATION_TASK_NAME);
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
}
