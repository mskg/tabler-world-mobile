import * as Location from 'expo-location';
import { AsyncStorage } from 'react-native';
import { updateSetting } from '../../redux/actions/settings';
import { getReduxStore } from '../../redux/getRedux';
import { LOCATION_TASK_NAME } from '../../tasks/Constants';
import { startLocationTask } from '../../tasks/location/startLocationTask';
import { logger } from './logger';

export async function enableNearbyTablers() {
    logger.log('enableNearbyTablers');

    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
        throw new Error('hasServicesEnabledAsync false');
    }

    // throws if location services are denied
    await Location.requestPermissionsAsync();

    if (await startLocationTask()) {
        await AsyncStorage.setItem(LOCATION_TASK_NAME, true.toString());

        getReduxStore().dispatch(
            updateSetting({ name: 'nearbyMembers', value: true }),
        );
    } else {
        throw new Error('startLocationTask false');
    }
}
