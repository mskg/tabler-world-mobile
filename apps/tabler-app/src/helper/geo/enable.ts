import * as Location from 'expo-location';
import { PermissionsAndroid, Platform } from 'react-native';
import { Features, isFeatureEnabled } from '../../model/Features';
import { updateSetting } from '../../redux/actions/settings';
import { getReduxStore } from '../../redux/getRedux';
import { startLocationTask } from '../../tasks/location/startLocationTask';
import { updateLocation } from '../../tasks/location/updateLocation';
import { logger } from './logger';

// tslint:disable-next-line: export-name
export async function enableNearbyTablers(forceRequest?: boolean) {
    logger.log('enableNearbyTablers');

    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
        throw new Error('hasServicesEnabledAsync false');
    }

    if (forceRequest) {
        // throws if location services are denied
        await Location.requestPermissionsAsync();

        if (Platform.OS === 'android' && Platform.Version >= 29) { // Android 10
            logger.debug('Android >= 10');

            // this forces the application to blur and we cannot continue our flow directly
            const request = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            );
            logger.debug('enableNearbyTablers Android', request);

            if (request['android.permission.ACCESS_BACKGROUND_LOCATION'] !== PermissionsAndroid.RESULTS.granted) {
                throw new Error('No background permission (2)');
            }
        }
    } else {
        await Location.requestPermissionsAsync();

        if (Platform.OS === 'android' && Platform.Version >= 29) { // Android 10
            const androidResult = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            );

            if (!androidResult) {
                throw new Error('No background permission (2)');
            }
        }
    }

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
