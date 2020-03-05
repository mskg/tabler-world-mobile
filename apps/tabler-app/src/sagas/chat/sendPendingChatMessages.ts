import { Features, isFeatureEnabled } from '../../model/Features';
import { markFailed, removeMessage } from '../../redux/actions/chat';
import { getReduxStore } from '../../redux/getRedux';
import { logger } from './logger';
import { sendMessage } from './sendMessage';

export async function sendPendingChatMessages() {
    if (!isFeatureEnabled(Features.Chat)) {
        return;
    }

    // we must send them in logical order
    const messages = getReduxStore().getState().chat.pendingSend;
    for (const msg of messages.filter((m) => m.numTries == null || m.numTries <= 5)) {
        try {
            await sendMessage(msg);
            logger.log('removing sent message', msg.id);
            getReduxStore().dispatch(removeMessage(msg.id as string));
        } catch (e) {
            logger.error(
                'chat-send',
                e,
                {
                    id: msg.id,
                    conversationId: msg.conversationId,
                    sender: msg.createdAt,
                    hasImage: msg.image != null,
                    numTries: msg.numTries,
                },
            );
            getReduxStore().dispatch(markFailed(msg.id as string));
        }
    }
}

export function* sendPendingMessageIterator() {
    yield sendPendingChatMessages();
    // yield checkBadge();
}
