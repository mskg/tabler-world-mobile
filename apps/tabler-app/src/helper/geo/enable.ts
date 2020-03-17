import * as Location from 'expo-location';
import { Features, isFeatureEnabled } from '../../model/Features';
import { updateSetting } from '../../redux/actions/settings';
import { getReduxStore } from '../../redux/getRedux';
import { startLocationTask } from '../../tasks/location/startLocationTask';
import { logger } from './logger';
import { updateLocation } from '../../tasks/location/updateLocation';

// tslint:disable-next-line: export-name
export async function enableNearbyTablers() {
    logger.log('enableNearbyTablers');

    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
        throw new Error('hasServicesEnabledAsync false');
    }

    // throws if location services are denied
    await Location.requestPermissionsAsync();

    // tslint:disable-next-line: no-empty
    if (isFeatureEnabled(Features.LocationWithoutBackground)) {
        await updateLocation(true, true);

        getReduxStore().dispatch(
            updateSetting({ name: 'nearbyMembers', value: true }),
        );
    } else if (await startLocationTask()) {
        // await AsyncStorage.setItem(LOCATION_TASK_NAME, true.toString());

        getReduxStore().dispatch(
            updateSetting({ name: 'nearbyMembers', value: true }),
        );

        // we don't set it to false explicitly
        // otherwise it cannot be removed
        // getReduxStore().dispatch(
        //     updateSetting({ name: 'nearbyMembersMap', value: false }),
        // );
    } else {
        throw new Error('startLocationTask false');
    }
}
