import * as TaskManager from 'expo-task-manager';
import { LOCATION_TASK_NAME } from './Constants';
import { runLocationTask } from './location/runLocationTask';
import { isLocationTaskEnabled } from './location/isLocationTaskEnabled';
import { logger } from './location/logger';
import { startLocationTask } from './location/startLocationTask';
import { stopLocationTaks } from './location/stopLocationTaks';

// tslint:disable-next-line: export-name
export async function registerLocationTask() {
    try {
        TaskManager.defineTask(LOCATION_TASK_NAME, runLocationTask);

        if (await isLocationTaskEnabled()) {
            await startLocationTask();
        } else {
            await stopLocationTaks();
            logger.log(`*********** ${LOCATION_TASK_NAME} DISABLED ***********`);
        }
    } catch (e) {
        logger.error(e, 'Registering of task failed', LOCATION_TASK_NAME);
    }
}
