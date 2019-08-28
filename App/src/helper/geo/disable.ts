import ApolloClient from 'apollo-client';
import * as Location from 'expo-location';
import { AsyncStorage } from 'react-native';
import { bootstrapApollo } from '../../apollo/bootstrapApollo';
import { DisableLocationServices } from '../../model/graphql/DisableLocationServices';
import { DisableLocationServicesMutation } from '../../queries/DisableLocationServices';
import { setLocation } from '../../redux/actions/location';
import { updateSetting } from '../../redux/actions/settings';
import { getReduxStore } from '../../redux/getRedux';
import { LOCATION_TASK_NAME } from '../../tasks/Constants';
import { logger } from "./logger";

export async function disableNearbyTablers() {
    logger.log("disableNearbyTablers");

    const client: ApolloClient<any> = await bootstrapApollo();
    await client.mutate<DisableLocationServices>({
        mutation: DisableLocationServicesMutation,
    });

    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (started) {
        logger.log("Stopping task", LOCATION_TASK_NAME);
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }

    getReduxStore().dispatch(setLocation({
        address: undefined,
        location: undefined,
    }));

    logger.log("Disabling location services", LOCATION_TASK_NAME);

    await AsyncStorage.setItem(LOCATION_TASK_NAME, false.toString());
    getReduxStore().dispatch(
        updateSetting({ name: "nearbyMembers", value: false })
    );
}