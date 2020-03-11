import * as TaskManager from 'expo-task-manager';
import { LOCATION_TASK_NAME } from './Constants';
import { isLocationTaskEnabled } from './location/isLocationTaskEnabled';
import { logger } from './location/logger';
import { runLocationTask } from './location/runLocationTask';
import { startLocationTask } from './location/startLocationTask';
import { stopLocationTaks } from './location/stopLocationTaks';

export function defineLocationTask() {
    TaskManager.defineTask(LOCATION_TASK_NAME, runLocationTask);
}

// tslint:disable-next-line: export-name
export async function registerLocationTask() {
    try {
        if (await isLocationTaskEnabled()) {
            await startLocationTask();
        } else {
            await stopLocationTaks();
            logger.log(`*********** ${LOCATION_TASK_NAME} DISABLED ***********`);
        }
    } catch (e) {
        logger.error('task-location-register', e);
    }
}
