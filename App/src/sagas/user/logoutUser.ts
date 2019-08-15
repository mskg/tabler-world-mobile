import Auth from '@aws-amplify/auth';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { Updates } from 'expo';
import * as SecureStore from 'expo-secure-store';
import { AsyncStorage } from 'react-native';
import { put } from 'redux-saga/effects';
import { bootstrapApollo, getPersistor } from '../../apollo/bootstrapApollo';
import * as actions from '../../redux/actions/user';
import { getReduxPersistor } from '../../redux/getRedux';
import { FILESTORAGE_KEY } from '../../redux/persistor/Constants';
import { disableLocationTracking } from '../settings/checkLocationTask';
import { removePushToken } from '../tokens/removePushToken';
import { logger } from './logger';

export function* logoutUser(_: typeof actions.logoutUser.shape) {
  logger.debug("logoutUser");

  try { yield removePushToken(); } catch (e) { logger.error(e, "Failed to remove token"); }
  try { yield disableLocationTracking(); } catch (e) { logger.error(e, "Failed to disable tracking"); }

  yield AsyncStorage.clear();
  yield SecureStore.deleteItemAsync(FILESTORAGE_KEY);

  yield put({ type: "__CLEAR__ALL__" });
  yield getReduxPersistor().flush();

  yield getReduxPersistor().purge();
  yield getReduxPersistor().flush();

  const client: ApolloClient<NormalizedCacheObject> = yield bootstrapApollo();
  yield client.cache.reset();
  yield getPersistor().purge();

  yield Auth.signOut();
  yield Updates.reloadFromCache();
}
