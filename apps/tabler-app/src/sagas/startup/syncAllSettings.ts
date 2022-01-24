import { all, fork, select, take } from 'redux-saga/effects';
import { updateParameters } from '../../helper/parameters/updateParameters';
import { IAppState } from '../../model/IAppState';
import { AuthState } from '../../model/state/AuthState';
import { singedIn } from '../../redux/actions/user';
import { pushLanguage } from '../settings/pushLanguage';
import { pushTimezone } from '../settings/pushTimezone';
import { restoreSettingsFromCloud } from '../settings/restoreSettingsFromCloud';
import { waitRetry } from '../waitRetry';
import { logger } from './logger';

export function* syncAllSettings() {
    logger.debug('Getting parameters');

    const authState: AuthState = yield select((state: IAppState) => state.auth);
    if (authState.state !== 'singedIn') {
        logger.debug('Not signed in', authState.state);
        yield take(singedIn.type);
    }

    yield waitRetry(updateParameters)();

    yield all([
        fork(waitRetry(pushLanguage)),
        fork(waitRetry(pushTimezone)),
        fork(waitRetry(restoreSettingsFromCloud)),
    ]);
}
