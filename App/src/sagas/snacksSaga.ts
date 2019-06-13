import { SagaIterator } from 'redux-saga';
import { all, takeEvery } from 'redux-saga/effects';
import { jsOfflineError } from './snacks/JSError';

export function* snacksSaga(): SagaIterator {
    yield all([
        // takeEvery(memberActions.fetchMembersFailure.type, fetchTablersFailure),
        takeEvery('Offline/JS_ERROR', jsOfflineError),
    ]);
}
