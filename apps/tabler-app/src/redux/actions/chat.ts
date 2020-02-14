import { IPendingChatMessage } from '../../model/IPendingChatMessage';
import { createAction } from './action';

/**
 * Authentication state signIn
 * signIn = loggedOut -> confirmSignIn -> ...
 */
export const setActiveConversation = createAction<'@@chat/activeConversation', string>(
    '@@chat/activeConversation',
);

export const clearActiveConversation = createAction<'@@chat/clearActiveConversation', string>(
    '@@chat/clearActiveConversation',
);

export const sendMessage = createAction<'@@chat/message/send', IPendingChatMessage>(
    '@@chat/message/send',
);

export const removeMessage = createAction<'@@chat/message/remove', string>(
    '@@chat/message/remove',
);

export const clearMessages = createAction<'@@chat/messages/clear', string>(
    '@@chat/messages/clear',
);

export const sendPendingMessages = createAction<'@@chat/messages/send'>(
    '@@chat/messages/send',
);

export const markFailed = createAction<'@@chat/message/markFailed', string>(
    '@@chat/message/markFailed',
);

export const setBadge = createAction<'@@chat/setBadgeCount', number>(
    '@@chat/setBadgeCount',
);

export const setText = createAction<'@@chat/text', {
    conversation: string,
    image?: string,
    text?: string,
}>(
    '@@chat/text',
);