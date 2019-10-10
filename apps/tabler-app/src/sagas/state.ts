import { AppState, AppStateStatus } from 'react-native';
import { Appearance } from 'react-native-appearance';
import { eventChannel } from 'redux-saga';
import { call, take, takeLatest } from 'redux-saga/effects';
import { checkAppState } from '../redux/actions/state';
import { checkForUpdates } from './state/checkForUpdates';
import { logger } from './state/logger';

function appState() {
    return eventChannel((emit) => {
        logger.log('Waiting for app state changes');

        const handler = (nextAppState: AppStateStatus) => {
            logger.log(nextAppState, Appearance.getColorScheme());
            emit(nextAppState);
        };

        AppState.addEventListener('change', handler);
        return () => AppState.removeEventListener('change', handler);
    });
}

function* runner(appStatus: AppStateStatus) {
    yield checkForUpdates(appStatus);
    // yield darkMode(appStatus);
}

// tslint:disable-next-line: export-name
export function* appStateSaga() {
    yield take(checkAppState);

    const appStateChannel = yield call(appState);
    yield takeLatest(appStateChannel, runner);
}
