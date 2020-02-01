import { SendMessage_sendMessage } from '../../model/graphql/sendMessage';
import { IPendingChatMessage } from '../../model/IPendingChatMessage';
import { ChatMessageEventId } from './ChatMessageEventId';

export function convertToChatMessage(message: IPendingChatMessage) {
    return {
        __typename: 'ChatMessage',
        eventId: ChatMessageEventId.Pending,
        id: message.id,
        receivedAt: message.createdAt || new Date(),
        senderId: message.sender,
        payload: {
            __typename: 'ChatMessagePayload',
            // we must convert to null
            image: message.image ? message.image : null,
            text: message.text ? message.text : null,
        },
        delivered: false,
        accepted: false,
    } as SendMessage_sendMessage;
}
