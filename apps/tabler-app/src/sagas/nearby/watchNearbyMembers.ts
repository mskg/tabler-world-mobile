import { GeoParameters } from '@mskg/tabler-world-config-app';
import { LocationData } from 'expo-location';
import { cancel, delay, fork, put, select, take } from 'redux-saga/effects';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { getParameterValue } from '../../helper/parameters/getParameterValue';
import { ParameterName } from '../../model/graphql/globalTypes';
import { LocationUpdate, LocationUpdateVariables } from '../../model/graphql/LocationUpdate';
import { NearbyMembers, NearbyMembersVariables } from '../../model/graphql/NearbyMembers';
import { IAppState } from '../../model/IAppState';
import { GetNearbyMembersQuery } from '../../queries/Location/GetNearbyMembersQuery';
import { LocationUpdateSubscription } from '../../queries/Location/LocationUpdateSubscription';
import { setNearby, startWatchNearby, stopWatchNearby } from '../../redux/actions/location';
import { updateLocation } from '../../tasks/location/updateLocation';
import { logger } from './logger';

function subscribe(location: LocationData, enabled: boolean) {
    logger.debug('start');

    const variables: LocationUpdateVariables = {
        hideOwnTable: enabled == null ? false : enabled,
        location: {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude,
        },
    };

    const client = cachedAolloClient();
    const initial = client.query<NearbyMembers, NearbyMembersVariables>({
        query: GetNearbyMembersQuery,
        fetchPolicy: 'network-only',
        // tslint:disable-next-line: object-shorthand-properties-first
        variables,
    });

    initial
        .then((result) => {
            if (result?.data?.nearbyMembers) {
                logger.debug('Setting initial list');
                put(setNearby(result.data.nearbyMembers));
            }
        })
        .catch((e) => logger.error(e, 'failed to run query'));

    const query = client.subscribe<LocationUpdate, LocationUpdateVariables>({
        query: LocationUpdateSubscription,
        // tslint:disable-next-line: object-shorthand-properties-first
        variables,
    });

    const subscription = query.subscribe(
        (nextVal) => {
            const members = nextVal.data?.locationUpdate || [];

            logger.debug('Received', members?.length, 'members');
            put(setNearby(members));
        },
        (e) => { logger.error(e, 'Failed to subscribe to conversationUpdate'); },
    );

    logger.log('subscribed');
    return subscription;
}

function* watch() {
    let subscription: ZenObservable.Subscription | null = null;
    const setting = yield getParameterValue<GeoParameters>(ParameterName.geo);

    try {
        // tslint:disable-next-line: no-constant-condition
        while (true) {
            const location: LocationData | null = yield select(
                (state: IAppState) => state.location.location);

            const { nearbyMembers, offline, hideOwnClubWhenNearby } = yield select(
                (state: IAppState) => state.settings);

            if (nearbyMembers && !offline) {
                yield updateLocation(false, false);
            }

            // try to subscribe if not already done
            if ((!subscription || subscription.closed) && location && nearbyMembers && !offline) {
                subscription = subscribe(location, hideOwnClubWhenNearby);
            }

            yield delay(setting.pollInterval);
        }
    } catch (ex) {
        logger.error(ex, 'Fetch nearby members unhandeled exception');
    } finally {
        if (subscription) {
            logger.log('Unsubscribe');
            subscription.unsubscribe();
        }
    }
}

export function* watchNearbyMembers() {
    while (yield take(startWatchNearby.type)) {
        logger.debug('startWatchNearby');

        // starts the task in the background
        const bgSyncTask = yield fork(watch);

        // wait for the user stop action
        const result = yield take(stopWatchNearby.type);
        logger.debug('stopWatchNearby', result);

        // user clicked stop. cancel the background task
        // this will cause the forked bgSync task to jump into its finally block
        yield cancel(bgSyncTask);
    }
}
