import { Audit } from '../../analytics/Audit';
import { AuditEventName } from '../../analytics/AuditEventName';
import { Features, isFeatureEnabled } from '../../model/Features';
import { sendPendingChatMessages } from '../../sagas/chat/sendPendingChatMessages';
import { logger } from './logger';

export async function runSend() {
    if (!isFeatureEnabled(Features.Chat)) {
        return;
    }

    try {
        logger.debug('Running');
        Audit.trackEvent(AuditEventName.SendPendingMessages);

        await sendPendingChatMessages();
    } catch (error) {
        logger.error(error, 'runSend');
    }
}
