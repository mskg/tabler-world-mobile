import { SagaIterator } from 'redux-saga';
import { takeLatest } from 'redux-saga/effects';
import * as actions from '../redux/actions/settings';
import { storePushToken } from './tokens/storePushToken';

export function* pushTokenSaga(): SagaIterator {
    yield takeLatest(actions.storePushToken.type, storePushToken);
}
