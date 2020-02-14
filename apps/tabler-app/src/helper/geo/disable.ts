import ApolloClient from 'apollo-client';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { DisableLocationServices, DisableLocationServicesVariables } from '../../model/graphql/DisableLocationServices';
import { DisableLocationServicesMutation } from '../../queries/Location/DisableLocationServicesMutation';
import { setLocation } from '../../redux/actions/location';
import { updateSetting } from '../../redux/actions/settings';
import { getReduxStore } from '../../redux/getRedux';
import { LOCATION_TASK_NAME } from '../../tasks/Constants';
import { stopLocationTaks } from '../../tasks/location/stopLocationTaks';
import { logger } from './logger';

// tslint:disable-next-line: export-name
export async function disableNearbyTablers(removeSettings = true) {
    logger.log('disableNearbyTablers');

    const settings = getReduxStore().getState().settings;

    // this removes the location
    const client: ApolloClient<any> = cachedAolloClient();
    await client.mutate<DisableLocationServices, DisableLocationServicesVariables>({
        mutation: DisableLocationServicesMutation,
        variables: {
            nearby: removeSettings ? false : settings.nearbyMembers || false,
            map: removeSettings ? false : settings.nearbyMembersMap || false,
        },
    });

    await stopLocationTaks();

    getReduxStore().dispatch(setLocation({
        address: undefined,
        location: undefined,
    }));

    logger.log('Disabling location services', LOCATION_TASK_NAME);

    // we keep the flags
    // if the user loggs in again, we can restore his settings
    getReduxStore().dispatch(
        updateSetting({
            name: 'nearbyMembers',
            value: removeSettings ? false : settings.nearbyMembers || false,
        }),
    );

    getReduxStore().dispatch(
        updateSetting({
            name: 'nearbyMembersMap',
            value: removeSettings ? false : settings.nearbyMembersMap || false,
        }),
    );
}
