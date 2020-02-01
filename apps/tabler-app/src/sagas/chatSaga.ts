import { Notifications } from 'expo';
import { SagaIterator } from 'redux-saga';
import { all, call, fork, takeEvery } from 'redux-saga/effects';
import { isDemoModeEnabled } from '../helper/demoMode';
import { Features, isFeatureEnabled } from '../model/Features';
import * as actions from '../redux/actions/chat';
import { checkBadge } from './chat/checkBadge';
import { sendPendingMessageIterator } from './chat/sendPendingChatMessages';

export function* chatSaga(): SagaIterator {
    yield fork(checkBadge);

    const demo = yield call(isDemoModeEnabled);
    if (!isFeatureEnabled(Features.Chat) || demo) {
        Notifications.setBadgeNumberAsync(0);
        return;
    }

    yield fork(sendPendingMessageIterator);

    yield all([
        // logout the user from the application
        takeEvery(actions.sendPendingMessages.type, sendPendingMessageIterator),
    ]);
}
