import { SagaIterator } from 'redux-saga';
import { all, fork, takeEvery } from 'redux-saga/effects';
import * as actions from '../redux/actions/chat';
import { checkBadge } from './chat/checkBadge';
import { sendPendingMessageIterator } from './chat/sendPendingChatMessages';

export function* chatSaga(): SagaIterator {
    yield fork(checkBadge);
    yield fork(sendPendingMessageIterator);

    yield all([
        // logout the user from the application
        takeEvery(actions.sendPendingMessages.type, sendPendingMessageIterator),
    ]);
}
