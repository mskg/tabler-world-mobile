import { LocationData } from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { LOCATION_TASK_NAME } from './Constants';
import { isLocationTaskEnabled } from './location/isLocationTaskEnabled';
import { handleLocationUpdate } from './location/handleLocationUpdate';
import { logger } from './location/logger';
import { startLocationTask } from './location/startLocationTask';
import { stopLocationTaks } from './location/stopLocationTaks';

// tslint:disable-next-line: export-name
export async function registerLocationTask() {
    try {
        TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
            if (error) {
                logger.error(error, `Failed to run ${LOCATION_TASK_NAME}`);
                return;
            }

            if (data) {
                // do something with the locations captured in the background
                const locations: LocationData[] = (data as any).locations;
                await handleLocationUpdate(locations);
            }
        });

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
