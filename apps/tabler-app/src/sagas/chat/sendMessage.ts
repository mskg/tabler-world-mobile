import { bootstrapApollo } from '../../apollo/bootstrapApollo';
import { SendMessage, SendMessageVariables } from '../../model/graphql/sendMessage';
import { IPendingChatMessage } from '../../model/IPendingChatMessage';
import { SendMessageMutation } from '../../queries/Conversations/SendMessageMutation';
import { addMessageToCache } from './addMessageToCache';
import { convertToChatMessage } from './convertToChatMessage';
import { logger } from './logger';
import { uploadImage } from './uploadImage';

export async function sendMessage(message: IPendingChatMessage) {
    logger.log('Trying to send', message);

    const client = await bootstrapApollo();
    const optimisticMessage = convertToChatMessage(message);

    // we don't use the optimistic UI here
    // because we want to keep the message if it fails
    // addMessageToCache(
    //     client,
    //     {
    //         data: {
    //             sendMessage: optimisticMessage,
    //         },
    //     },
    //     message.conversationId,
    // );

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

        update: (c, cache) => addMessageToCache(c, cache, message.conversationId),
    });
    // } catch (e) {
    //     logger.error(e, 'Failed to send message');

    //     // we don't use the optimistic UI here
    //     // because we want to keep the message if it fails
    //     addMessageToCache(
    //         client,
    //         {
    //             data: {
    //                 sendMessage: {
    //                     ...optimisticMessage,
    //                     eventId: ChatMessageEventId.Failed,
    //                 },
    //             },
    //         },
    //         message.conversationId,
    //     );
    // }
}
