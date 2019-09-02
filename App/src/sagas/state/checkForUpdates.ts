import { Updates } from 'expo';
import { AppStateStatus } from 'react-native';
import { put } from 'redux-saga/effects';
import { updateAvailable } from '../../redux/actions/state';
import { logger } from './logger';

/**
 * Checks for App updates
 */
export function* checkForUpdates(state: AppStateStatus) {
    if (state !== 'active') {
      return;
  }

    try {
      const update = yield Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        logger.log('An update was found, downloading...');
        yield Updates.fetchUpdateAsync();

        yield put(updateAvailable());
    } else {
        logger.debug('No updates were found');
    }
  } catch (e) {
    // we don't handle this as errors
      logger.log(e, 'Error while trying to check for updates');
  }
}
