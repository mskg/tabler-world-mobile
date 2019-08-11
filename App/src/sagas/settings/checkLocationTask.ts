import { NormalizedCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import * as Location from 'expo-location';
import { AsyncStorage } from 'react-native';
import { bootstrapApollo } from '../../apollo/bootstrapApollo';
import { DisableLocationServices } from '../../model/graphql/DisableLocationServices';
import { DisableLocationServicesMutation } from '../../queries/DisableLocationServices';
import * as settingActions from '../../redux/actions/settings';
import { LOCATION_TASK_NAME } from '../../tasks/Const';
import { startLocationTask } from '../../tasks/Location';
import { logger } from './logger';

/**
 * When a favorite is toggled, mark the record as modified
 */
export function* checkLocationTask(a: typeof settingActions.updateSetting.shape) {
    if (a.payload.name !== "nearbyMembers") {
        return;
    }

    logger.log("Processing", a.payload);
    yield AsyncStorage.setItem(LOCATION_TASK_NAME, a.payload.value.toString());

    if (a.payload.value == false) {
        logger.log("Disabling location services", LOCATION_TASK_NAME);
        const client: ApolloClient<NormalizedCache> = yield bootstrapApollo();
        yield client.mutate<DisableLocationServices>({
            mutation: DisableLocationServicesMutation,
        });

        logger.log("Stopping task", LOCATION_TASK_NAME);
        yield Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    } else {
        yield startLocationTask();
    }
}
