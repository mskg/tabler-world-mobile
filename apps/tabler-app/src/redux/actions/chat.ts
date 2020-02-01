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

export const sendPendingMessages = createAction<'@@chat/sendPending'>(
    '@@chat/sendPending',
);

export const markFailed = createAction<'@@chat/markFailed', string>(
    '@@chat/markFailed',
);

export const setBadge = createAction<'@@chat/badge', number>(
    '@@chat/badge',
);