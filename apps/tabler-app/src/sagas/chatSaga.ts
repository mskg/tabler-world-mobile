import { SagaIterator } from 'redux-saga';
import { all, fork, takeEvery, call } from 'redux-saga/effects';
import * as actions from '../redux/actions/chat';
import { sendPendingMessageIterator } from './chat/sendPendingChatMessages';
import { isFeatureEnabled, Features } from '../model/Features';
import { isDemoModeEnabled } from '../helper/demoMode';

export function* chatSaga(): SagaIterator {
    const demo = yield call(isDemoModeEnabled);

    if (!isFeatureEnabled(Features.Chat) || demo) {
        return;
    }

    yield fork(sendPendingMessageIterator);

    yield all([
        // logout the user from the application
        takeEvery(actions.sendPendingMessages.type, sendPendingMessageIterator),
    ]);
}
