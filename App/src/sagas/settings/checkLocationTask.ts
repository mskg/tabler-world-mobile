import * as Location from 'expo-location';
import { AsyncStorage } from 'react-native';
import * as settingActions from '../../redux/actions/settings';
import { LOCATION_TASK_NAME } from '../../tasks/Const';
import { startLocationTask } from '../../tasks/Location';
import { logger } from './logger';

/**
 * When a favorite is toggled, mark the record as modified
 */
export function* checkLocationTask(a: typeof settingActions.updateSetting.shape) {
    if (a.payload.name !== "nearbyMembers") {
        return;
    }

    logger.log("Processing", a.payload);
    yield AsyncStorage.setItem(LOCATION_TASK_NAME, a.payload.value.toString());

    if (a.payload.value == false) {
        logger.log("Stopping task", LOCATION_TASK_NAME);
        yield Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    } else {
        yield startLocationTask();
    }
}
