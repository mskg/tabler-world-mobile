import ApolloClient from 'apollo-client';
import { AsyncStorage } from 'react-native';
import { bootstrapApollo } from '../../apollo/bootstrapApollo';
import { DisableLocationServices } from '../../model/graphql/DisableLocationServices';
import { DisableLocationServicesMutation } from '../../queries/Location/DisableLocationServices';
import { setLocation } from '../../redux/actions/location';
import { updateSetting } from '../../redux/actions/settings';
import { getReduxStore } from '../../redux/getRedux';
import { LOCATION_TASK_NAME } from '../../tasks/Constants';
import { stopLocationTaks } from '../../tasks/location/stopLocationTaks';
import { logger } from './logger';

export async function disableNearbyTablers() {
    logger.log('disableNearbyTablers');

    const client: ApolloClient<any> = await bootstrapApollo();
    await client.mutate<DisableLocationServices>({
        mutation: DisableLocationServicesMutation,
    });

    await stopLocationTaks();

    getReduxStore().dispatch(setLocation({
        address: undefined,
        location: undefined,
    }));

    logger.log('Disabling location services', LOCATION_TASK_NAME);

    await AsyncStorage.setItem(LOCATION_TASK_NAME, false.toString());
    getReduxStore().dispatch(
        updateSetting({ name: 'nearbyMembers', value: false }),
    );
}
