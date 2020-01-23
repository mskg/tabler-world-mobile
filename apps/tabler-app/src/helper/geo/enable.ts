import * as Location from 'expo-location';
import { updateSetting } from '../../redux/actions/settings';
import { getReduxStore } from '../../redux/getRedux';
import { startLocationTask } from '../../tasks/location/startLocationTask';
import { logger } from './logger';

// tslint:disable-next-line: export-name
export async function enableNearbyTablers() {
    logger.log('enableNearbyTablers');

    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
        throw new Error('hasServicesEnabledAsync false');
    }

    // throws if location services are denied
    await Location.requestPermissionsAsync();

    if (await startLocationTask()) {
        // await AsyncStorage.setItem(LOCATION_TASK_NAME, true.toString());

        getReduxStore().dispatch(
            updateSetting({ name: 'nearbyMembers', value: true }),
        );

        getReduxStore().dispatch(
            updateSetting({ name: 'nearbyMembersMap', value: false }),
        );
    } else {
        throw new Error('startLocationTask false');
    }
}
