import ApolloClient from 'apollo-client';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { DisableLocationServices } from '../../model/graphql/DisableLocationServices';
import { DisableLocationServicesMutation } from '../../queries/Location/DisableLocationServicesMutation';
import { setLocation } from '../../redux/actions/location';
import { updateSetting } from '../../redux/actions/settings';
import { getReduxStore } from '../../redux/getRedux';
import { LOCATION_TASK_NAME } from '../../tasks/Constants';
import { stopLocationTaks } from '../../tasks/location/stopLocationTaks';
import { logger } from './logger';

// tslint:disable-next-line: export-name
export async function disableNearbyTablers() {
    logger.log('disableNearbyTablers');

    const client: ApolloClient<any> = cachedAolloClient();
    await client.mutate<DisableLocationServices>({
        mutation: DisableLocationServicesMutation,
    });

    await stopLocationTaks();

    getReduxStore().dispatch(setLocation({
        address: undefined,
        location: undefined,
    }));

    logger.log('Disabling location services', LOCATION_TASK_NAME);

    // await AsyncStorage.setItem(LOCATION_TASK_NAME, false.toString());
    getReduxStore().dispatch(
        updateSetting({ name: 'nearbyMembers', value: false }),
    );

    getReduxStore().dispatch(
        updateSetting({ name: 'nearbyMembersMap', value: false }),
    );
}
