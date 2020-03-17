import { GeoParameters } from '@mskg/tabler-world-config-app';
import { LocationData } from 'expo-location';
import { cancel, delay, fork, select, take } from 'redux-saga/effects';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { createApolloContext } from '../../helper/createApolloContext';
import { isDemoModeEnabled } from '../../helper/demoMode';
import { getParameterValue } from '../../helper/parameters/getParameterValue';
import { ParameterName } from '../../model/graphql/globalTypes';
import { LocationUpdate, LocationUpdateVariables } from '../../model/graphql/LocationUpdate';
import { NearbyMembers, NearbyMembersVariables } from '../../model/graphql/NearbyMembers';
import { IAppState } from '../../model/IAppState';
import { GetNearbyMembersQuery } from '../../queries/Location/GetNearbyMembersQuery';
import { LocationUpdateSubscription } from '../../queries/Location/LocationUpdateSubscription';
import { setNearby, startWatchNearby, stopWatchNearby } from '../../redux/actions/location';
import { getReduxStore } from '../../redux/getRedux';
import { updateLocation } from '../../tasks/location/updateLocation';
import { logger } from './logger';
import { LocationState } from '../../model/state/LocationState';

function refreshByQuery(enabled: boolean) {
    const store = getReduxStore();

    const variables: LocationUpdateVariables = {
        hideOwnTable: enabled == null ? false : enabled,
    };

    const client = cachedAolloClient();

    const initial = client.query<NearbyMembers, NearbyMembersVariables>({
        query: GetNearbyMembersQuery,
        fetchPolicy: 'network-only',
        // tslint:disable-next-line: object-shorthand-properties-first
        variables,
        context: createApolloContext('nearby-retry-query'),
    });

    initial
        .then((result) => {
            if (result?.data?.nearbyMembers) {
                logger.debug('Setting initial list');
                store.dispatch(setNearby(result.data.nearbyMembers));
            }
        })
        .catch((e) => logger.log('failed to run query', e));
}

function subscribeToUpdates(enabled: boolean) {
    logger.debug('start');

    const store = getReduxStore();

    const variables: LocationUpdateVariables = {
        hideOwnTable: enabled == null ? false : enabled,
    };

    const client = cachedAolloClient();

    const initial = client.query<NearbyMembers, NearbyMembersVariables>({
        query: GetNearbyMembersQuery,
        fetchPolicy: 'network-only',
        // tslint:disable-next-line: object-shorthand-properties-first
        variables,
        context: createApolloContext('nearby-initial-query'),
    });

    initial
        .then((result) => {
            if (result?.data?.nearbyMembers) {
                logger.debug('Setting initial list');
                store.dispatch(setNearby(result.data.nearbyMembers));
            }
        })
        .catch((e) => logger.log('failed to run query', e));

    const query = client.subscribe<LocationUpdate, LocationUpdateVariables>({
        query: LocationUpdateSubscription,
        // tslint:disable-next-line: object-shorthand-properties-first
        variables,
    });

    const subscription = query.subscribe(
        (nextVal) => {
            const members = nextVal.data?.locationUpdate || [];

            logger.debug('Received', members?.length, 'members');
            store.dispatch(setNearby(members));
        },
        (e) => { logger.error('nearby-subscribe', e); },
    );

    logger.log('subscribed');
    return subscription;
}

function* watch() {
    let subscription: ZenObservable.Subscription | null = null;
    const setting = yield getParameterValue<GeoParameters>(ParameterName.geo);
    const isDemo: boolean = yield isDemoModeEnabled();

    try {
        // tslint:disable-next-line: no-constant-condition
        while (true) {
            const location: LocationState = yield select(
                (state: IAppState) => state.location);

            const { nearbyMembers, offline, hideOwnClubWhenNearby } = yield select(
                (state: IAppState) => state.settings);

            const hourAgo = new Date();
            hourAgo.setHours(hourAgo.getHours() - 1);

            if (nearbyMembers && !offline && (
            !location.location                              // no location at all
                || !location.timestamp                      // compiler
                || (location.timestamp < hourAgo.valueOf()) // location is older than 1 hour
            )) {
                yield updateLocation(false, false);
            }

            if (isDemo) {
                refreshByQuery(hideOwnClubWhenNearby);
            } else {
                // try to subscribe if not already done
                if ((!subscription || subscription.closed) && location.location && nearbyMembers && !offline) {
                    subscription = subscribeToUpdates(hideOwnClubWhenNearby);
                }
            }

            yield delay(setting.pollInterval);
        }
    } catch (ex) {
        logger.error('nearby-watch', ex);
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
