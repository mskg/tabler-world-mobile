import { AppStateStatus } from 'react-native';
import { put, select } from 'redux-saga/effects';
import { IAppState } from '../../model/IAppState';
import { updateSetting } from '../../redux/actions/settings';
import { getColorScheme } from '../../theme/getColorScheme';
import { logger } from './logger';

/**
 * Checks for App updates
 */
export function* darkMode(appStatus: AppStateStatus) {
    if (appStatus !== 'active') {
        return;
    }

    const scheme = getColorScheme();
    if (scheme === 'no-preference') { return; }

    const current = yield select((state: IAppState) => state.settings.darkMode);
    logger.debug(current, scheme);

    if ((current === true && scheme === 'dark')
        || (current === false && scheme === 'light')
    ) {
        logger.debug('scheme did not change');
        return;
    }

    logger.debug('scheme is', scheme);

    yield put(updateSetting({
        name: 'darkMode',
        value: scheme === 'dark',
    }));
}
