import { Notifications } from 'expo';
import { Platform } from 'react-native';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { Categories, Logger } from '../../helper/Logger';
import { Conversation, ConversationVariables } from '../../model/graphql/Conversation';
import { GetConversations } from '../../model/graphql/GetConversations';
import { GetConversationQuery } from '../../queries/Conversations/GetConversationQuery';
import { GetConversationsQuery } from '../../queries/Conversations/GetConversationsQuery';
import { setBadge } from '../../redux/actions/chat';
import { getReduxStore } from '../../redux/getRedux';

const logger = new Logger(Categories.Screens.Conversation);

export async function updateBadgeFromConversations() {
    if (Platform.OS !== 'ios') { return; }

    const client = cachedAolloClient();

    const conversation = client.readQuery<GetConversations>({
        query: GetConversationsQuery,
    });

    const unread = conversation?.Conversations.nodes.find((n) => n.hasUnreadMessages);
    if (!unread) {
        getReduxStore().dispatch(setBadge(0));
        await Notifications.setBadgeNumberAsync(0);
    } else {
        getReduxStore().dispatch(setBadge(1));
        await Notifications.setBadgeNumberAsync(1);
    }
}

export function markConversationRead(id) {
    const client = cachedAolloClient();

    // we are klicked and must be in the list
    const conversation = client.readQuery<Conversation, ConversationVariables>({
        query: GetConversationQuery,
        variables: {
            id,
            token: undefined,
        },
    });

    if (conversation == null || conversation.Conversation == null) { return; }

    logger.log('Marking conversation', id, 'read!');
    client.writeQuery<Conversation>({
        query: GetConversationQuery,
        data: {
            ...conversation,
            Conversation: {
                ...conversation.Conversation,
                hasUnreadMessages: false,
            },
        },
    });
}
