import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { Logger } from '../../helper/Logger';
import { Features, isFeatureEnabled } from '../../model/Features';
import { Conversation, ConversationVariables } from '../../model/graphql/Conversation';
import { AppNotifications, ChatMessageNotification } from '../../model/NotificationPayload';
import { GetConversationQuery } from '../../queries/Conversations/GetConversationQuery';
import { showConversation } from '../../redux/actions/navigation';
import { getReduxStore } from '../../redux/getRedux';
import { INotificationHandler, NotificationHandlerResult } from './INotificationHandler';

export class ChatMessageHandler implements INotificationHandler<ChatMessageNotification> {
    constructor(private logger: Logger) {
    }

    canHandle(notification: AppNotifications) {
        if (!isFeatureEnabled(Features.Chat)) {
            return false;
        }

        return notification && notification.reason === 'chatmessage';
    }

    tryHandle(notification: ChatMessageNotification): NotificationHandlerResult {
        const activeConversation = getReduxStore().getState().chat.activeConversation;
        if (activeConversation === null || notification.payload.conversationId !== activeConversation) {
            return NotificationHandlerResult.ShowNotification;
        }

        this.updateConversation(notification);
        return NotificationHandlerResult.Handeled;
    }

    private updateConversation(notification: ChatMessageNotification) {
        this.logger.debug('updateConversation', notification.payload.conversationId);

        const client = cachedAolloClient();
        client.query<Conversation, ConversationVariables>({
            query: GetConversationQuery,
            variables: {
                id: notification.payload.conversationId,
                dontMarkAsRead: true,
            },
            fetchPolicy: 'network-only',
        });
    }

    onClick(el: ChatMessageNotification, received: boolean) {
        if (!received) {
            // fetch it already
            this.updateConversation(el);
        }

        getReduxStore().dispatch(showConversation(el.payload.conversationId));
    }
}
