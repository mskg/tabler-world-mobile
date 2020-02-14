import { isDemoModeEnabled } from '../../helper/demoMode';
import { SendMessage, SendMessageVariables } from '../../model/graphql/sendMessage';
import { IPendingChatMessage } from '../../model/IPendingChatMessage';
import { SendMessageMutation } from '../../queries/Conversations/SendMessageMutation';
import { addMessageToCache } from './addMessageToCache';
import { convertToChatMessage } from './convertToChatMessage';
import { logger } from './logger';
import { uploadImage } from './uploadImage';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';

export async function sendMessage(message: IPendingChatMessage) {
    logger.log('sendMessage', message.conversationId, '->', message.id);

    const client = cachedAolloClient();
    const optimisticMessage = convertToChatMessage(message);

    if (await isDemoModeEnabled()) {
        optimisticMessage.eventId = (Date.now() - 5).toString();
        optimisticMessage.delivered = true;
        optimisticMessage.accepted = true;
        optimisticMessage.receivedAt = Date.now();

        logger.debug(optimisticMessage);

        addMessageToCache(
            client.cache,
            // we need a deep clone
            { data: { sendMessage: JSON.parse(JSON.stringify(optimisticMessage)) } },
            message.conversationId,
        );

        optimisticMessage.id = Date.now().toString();
        optimisticMessage.eventId = Date.now().toString();
        optimisticMessage.senderId = 5;
        optimisticMessage.payload.text = 'The answer is always 42';
        optimisticMessage.payload.image = null;

        addMessageToCache(
            client.cache,
            // we need a deep clone
            { data: { sendMessage: JSON.parse(JSON.stringify(optimisticMessage)) } },
            message.conversationId,
        );

        return;
    }

    // try {
    let image: string | null = null;
    if (message.image != null) {
        image = await uploadImage(message.conversationId, message.image);
        // need to check fail here
    }

    await client.mutate<SendMessage, SendMessageVariables>({
        mutation: SendMessageMutation,
        variables: {
            image,
            id: optimisticMessage.id as string,
            text: optimisticMessage.payload.text,
            conversation: message.conversationId,
        },

        update: (cache, data) => addMessageToCache(cache, data, message.conversationId),
    });

}
