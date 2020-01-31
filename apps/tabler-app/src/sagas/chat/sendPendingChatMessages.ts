import { Features, isFeatureEnabled } from '../../model/Features';
import { markFailed, removeMessage } from '../../redux/actions/chat';
import { getReduxStore } from '../../redux/getRedux';
import { logger } from './logger';
import { sendMessage } from './sendMessage';
import { isDemoModeEnabled } from '../../helper/demoMode';

export async function sendPendingChatMessages() {
    if (!isFeatureEnabled(Features.Chat) || (await isDemoModeEnabled())) {
        return;
    }

    // we must send them in logical order
    const messages = getReduxStore().getState().chat.pendingSend;
    for (const msg of messages.filter((m) => m.numTries == null || m.numTries <= 5)) {
        try {
            await sendMessage(msg);
            getReduxStore().dispatch(removeMessage(msg.id as string));
        } catch (e) {
            logger.error(e, 'Failed to send', msg.id);
            getReduxStore().dispatch(markFailed(msg.id as string));
        }
    }
}

export function* sendPendingMessageIterator() {
    yield sendPendingChatMessages();
}
