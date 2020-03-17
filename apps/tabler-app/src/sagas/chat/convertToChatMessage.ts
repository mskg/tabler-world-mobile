import { SendMessage_sendMessage } from '../../model/graphql/sendMessage';
import { IPendingChatMessage } from '../../model/IPendingChatMessage';
import { ChatMessageEventId } from './ChatMessageEventId';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { GetMeQuery } from '../../queries/Member/GetMeQuery';
import { Me } from '../../model/graphql/Me';
import { createApolloContext } from '../../helper/createApolloContext';

export async function convertToChatMessage(message: IPendingChatMessage) {
    const client = cachedAolloClient();
    const member = await client.query<Me>({
        query: GetMeQuery,
        fetchPolicy: 'cache-first',
        context: createApolloContext('chat-send-convert', { doNotRetry: true }),
    });

    return {
        __typename: 'ChatMessage',
        eventId: ChatMessageEventId.Pending,
        id: message.id,
        receivedAt: message.createdAt || new Date(),
        sender: {
            __typename: 'Member',
            id: message.sender,
            firstname: member?.data?.Me.firstname,
            lastname: member?.data?.Me.lastname,
            pic: member?.data?.Me.pic,
        },
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
