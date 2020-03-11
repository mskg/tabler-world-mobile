import Auth from '@aws-amplify/auth';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { Updates } from 'expo';
import * as SecureStore from 'expo-secure-store';
import * as TaskManager from 'expo-task-manager';
import { AsyncStorage } from 'react-native';
import { put } from 'redux-saga/effects';
import { cachedAolloClient, getApolloCachePersistor } from '../../apollo/bootstrapApollo';
import { setBadgeNumber } from '../../helper/bagde';
import { disableNearbyTablers } from '../../helper/geo/disable';
import * as actions from '../../redux/actions/user';
import { getReduxPersistor } from '../../redux/getRedux';
import { FILESTORAGE_KEY } from '../../redux/persistor/Constants';
import { removePushToken } from '../tokens/removePushToken';
import { logger } from './logger';

export function* logoutUser(_: typeof actions.logoutUser.shape) {
    logger.debug('logoutUser');

    try { yield removePushToken(); } catch (e) { logger.error('logout-push-token', e); }
    try { yield disableNearbyTablers(); } catch (e) { logger.error('logout-nearby', e); }

    yield AsyncStorage.clear();

    try {
        yield TaskManager.unregisterAllTasksAsync();
    } catch (e) {
        logger.error('logout-tasks', e);
    }

    yield SecureStore.deleteItemAsync(FILESTORAGE_KEY);

    yield put({ type: '__CLEAR__ALL__' });
    yield getReduxPersistor().flush();

    yield getReduxPersistor().purge();
    yield getReduxPersistor().flush();

    const client: ApolloClient<NormalizedCacheObject> = cachedAolloClient();
    yield client.cache.reset();
    yield getApolloCachePersistor().purge();

    yield setBadgeNumber(0);

    yield Auth.signOut();
    yield Updates.reloadFromCache();
}
