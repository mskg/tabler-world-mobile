import { select, take } from 'redux-saga/effects';
import { updateParameters } from '../../helper/parameters/updateParameters';
import { IAppState } from '../../model/IAppState';
import { singedIn } from '../../redux/actions/user';
import { logger } from './logger';

export function* getParameters() {
    logger.debug('Getting parameters');

    const authState = yield select((state: IAppState) => state.auth.state);
    if (authState !== 'singedIn') {
        logger.debug('Not signed in');
        yield take(singedIn.type);
    }

    yield updateParameters();
}
