import { GeoParameters } from '@mskg/tabler-world-config-app';
import { ApolloQueryResult } from 'apollo-client';
import { LocationData } from 'expo-location';
import { cancel, cancelled, delay, fork, put, select, take } from 'redux-saga/effects';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { getParameterValue } from '../../helper/parameters/getParameterValue';
import { ParameterName } from '../../model/graphql/globalTypes';
import { NearbyMembers, NearbyMembersVariables } from '../../model/graphql/NearbyMembers';
import { IAppState } from '../../model/IAppState';
import { GetNearbyMembersQuery } from '../../queries/Location/GetNearbyMembersQuery';
import { setNearby, startWatchNearby, stopWatchNearby } from '../../redux/actions/location';
import { logger } from './logger';

function* bgSync() {
    logger.debug('start');

    try {
        // yield put(setNearby([]));
        const setting = yield getParameterValue<GeoParameters>(ParameterName.geo);

        // tslint:disable-next-line: no-constant-condition
        while (true) {
            const client = cachedAolloClient();

            try {
                const location: LocationData | null = yield select(
                    (state: IAppState) => state.location.location);

                const enabled: boolean = yield select(
                    (state: IAppState) => state.settings.nearbyMembers);

                const offline: boolean = yield select(
                    (state: IAppState) => state.connection.offline);

                if (location && enabled && !offline) {
                    const hideOwnTable: boolean = yield select(
                        (state: IAppState) => state.settings.hideOwnClubWhenNearby);

                    const result: ApolloQueryResult<NearbyMembers> = yield client.query<NearbyMembers, NearbyMembersVariables>({
                        query: GetNearbyMembersQuery,
                        variables: {
                            hideOwnTable: hideOwnTable || false,
                            location: {
                                longitude: location.coords.longitude,
                                latitude: location.coords.latitude,
                            },
                        },
                        fetchPolicy: 'network-only',
                    });

                    const members = result.data?.nearbyMembers || [];
                    logger.debug('found', members.length, 'members');

                    // best effort
                    yield put(setNearby(members));

                    // if (members) {
                    //     const corrections: AddressUpdateInput[] = yield geocodeMissing(members);

                    //     if (corrections) {
                    //         yield client.mutate<UpdateLocationAddress, UpdateLocationAddressVariables>({
                    //             mutation: UpdateLocationAddressMutation,
                    //             variables: {
                    //                 corrections,
                    //             },
                    //         });

                    //         // update adresses
                    //         corrections.forEach((c) => {
                    //             const existing = members.find((m) => m.member.id === c.member);
                    //             if (existing != null && c.address != null) {
                    //                 existing.address = c.address;
                    //             }
                    //         });

                    //         // updated
                    //         yield put(setNearby(members));
                    //     }
                    // }
                } else {
                    yield put(setNearby([]));
                    logger.debug('no location or disabled');
                }
            } catch (e) {
                logger.error(e, 'Fetch nearby members');
            }

            logger.debug('sleeping');
            yield delay(setting.pollInterval);
        }
    } catch (ex) {
        logger.error(ex, 'Fetch nearby members unhandeled exception');
    } finally {
        if (yield cancelled()) {
            logger.debug('cancelled');
        }
    }
}

export function* watchNearbyMembers() {
    while (yield take(startWatchNearby.type)) {
        logger.debug('startWatchNearby');

        // starts the task in the background
        const bgSyncTask = yield fork(bgSync);

        // wait for the user stop action
        const result = yield take(stopWatchNearby.type);
        logger.debug('stopWatchNearby', result);

        // user clicked stop. cancel the background task
        // this will cause the forked bgSync task to jump into its finally block
        yield cancel(bgSyncTask);
    }
}
