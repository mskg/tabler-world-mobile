import { IExpoNotification } from '../../model/NotificationPayload';
import { getReduxStore } from '../../redux/getRedux';

export function testNotifications(handleNotification: (n: IExpoNotification) => void) {
    const activeConversation = getReduxStore().getState().chat.activeConversation;

    handleNotification({
        isMultiple: false,
        origin: 'received',
        remote: true,
        data: {
            reason: 'chatmessage',
            body: 'New Conversation',
            payload: {
                conversationId: activeConversation + '11231',
                eventId: '1',
                id: '1',
                payload: {
                    text: '1',
                },
                senderId: 0,
                receivedAt: Date.now(),
                type: 'text',
            },
        },
    });

    handleNotification({
        isMultiple: false,
        origin: 'received',
        remote: true,
        data: {
            reason: 'birthday',
            title: 'Er is jemand jarig!',
            body: `Help me om Aart een fantastische dag te bezorgen!`,
            payload: {
                id: 14225,
                date: new Date(),
            },
        },
    });

    handleNotification({
        isMultiple: false,
        origin: 'received',
        remote: true,
        data: {
            reason: 'advertisment',
            body: 'AD',
            payload: {
                url: 'https://www.google.de',
            },
        },
    });

    handleNotification({
        isMultiple: false,
        origin: 'received',
        remote: true,
        data: {
            reason: 'chatmessage',
            body: 'Current Conversation',
            payload: {
                conversationId: activeConversation,
                eventId: '1',
                id: '1',
                payload: {
                    text: '1',
                },
                senderId: 0,
                receivedAt: Date.now(),
                type: 'text',
            },
        },
    });
}
