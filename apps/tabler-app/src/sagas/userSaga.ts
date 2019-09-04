import { SagaIterator } from 'redux-saga';
import { all, takeEvery } from 'redux-saga/effects';
import * as actions from '../redux/actions/user';
import { logoutUser } from './user/logoutUser';

export function* userSaga(): SagaIterator {
    yield all([
        // logout the user from the application
        takeEvery(actions.logoutUser.type, logoutUser),
    ]);
}
