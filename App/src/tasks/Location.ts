import { LocationData } from "expo-location";
import * as TaskManager from "expo-task-manager";
import { AsyncStorage } from "react-native";
import { LOCATION_TASK_NAME } from "./Constants";
import { handleLocationUpdate } from './location/handleLocation';
import { logger } from './location/logger';
import { startLocationTask } from './location/startLocationTask';
import { stopLocationTaks } from './location/stopLocationTaks';

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

    if ((await AsyncStorage.getItem(LOCATION_TASK_NAME)) === "true") {
      await startLocationTask();
    } else {
      await stopLocationTaks();
      logger.log(`*********** ${LOCATION_TASK_NAME} DISABLED ***********`);
    }
  } catch (e) {
    logger.error(e, "Registering of task failed", LOCATION_TASK_NAME);
  }
}
