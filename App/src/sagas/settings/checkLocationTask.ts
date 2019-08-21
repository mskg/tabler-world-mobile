import { NormalizedCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import * as Location from 'expo-location';
import { AsyncStorage } from 'react-native';
import { put } from 'redux-saga/effects';
import { bootstrapApollo } from '../../apollo/bootstrapApollo';
import { DisableLocationServices } from '../../model/graphql/DisableLocationServices';
import { DisableLocationServicesMutation } from '../../queries/DisableLocationServices';
import { setLocation } from '../../redux/actions/location';
import * as settingActions from '../../redux/actions/settings';
import { LOCATION_TASK_NAME } from '../../tasks/Constants';
import { startLocationTask } from '../../tasks/location/startLocationTask';
import { logger } from './logger';

/**
 * When a favorite is toggled, mark the record as modified
 */
export function* checkLocationTask(a: typeof settingActions.updateSetting.shape) {
    if (a.payload.name !== "nearbyMembers") {
        return;
    }

    if (a.payload.value == false) {
        yield disableLocationTracking();
    } else {
        yield startLocationTask();
    }

    logger.log("Processing", a.payload);
    yield AsyncStorage.setItem(LOCATION_TASK_NAME, a.payload.value.toString());
}

export function* disableLocationTracking() {
    // const isOn = (yield AsyncStorage.getItem(LOCATION_TASK_NAME)) === "true";
    // if (!isOn) {
    //     logger.debug("not on");
    //     return;
    // }
    logger.log("Stopping task", LOCATION_TASK_NAME);
    yield Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);

    yield put(setLocation({
        address: undefined,
        location: undefined,
    }));

    logger.log("Disabling location services", LOCATION_TASK_NAME);
    const client: ApolloClient<NormalizedCache> = yield bootstrapApollo();
    yield client.mutate<DisableLocationServices>({
        mutation: DisableLocationServicesMutation,
    });
}
