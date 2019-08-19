import * as Location from "expo-location";
import { GeoParameters } from '../../helper/parameters/Geo';
import { getParameterValue } from '../../helper/parameters/getParameter';
import { ParameterName } from '../../model/graphql/globalTypes';
import { LOCATION_TASK_NAME } from "../Constants";
import { handleLocationUpdate } from './handleLocation';
import { logger } from './logger';

export async function startLocationTask() {
  const enabled = await Location.hasServicesEnabledAsync();
  const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

  if (enabled) {
    logger.debug("Requesting permissions");
    await Location.requestPermissionsAsync();

    if (started) {
      logger.log(LOCATION_TASK_NAME, "already started");
    }
    else {
      try {
        logger.log("Starting task", LOCATION_TASK_NAME);

        const settings = await getParameterValue<GeoParameters>(ParameterName.geo);
        delete settings.pollInterval;
        logger.debug("settings", settings);

        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, settings);

        const location = await Location.getCurrentPositionAsync();
        handleLocationUpdate([location]);
      }
      catch (e) {
        logger.error(e, `Start of ${LOCATION_TASK_NAME} failed`);
      }
    }
  }
  else {
    logger.log("*********** LOCATION SERVICES DISABLED ***********");
  }
}
