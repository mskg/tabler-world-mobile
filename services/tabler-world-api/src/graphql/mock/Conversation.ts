import { Member } from './Member';

export const Conversation = (root: any, args?: any, context?: any, _info?: any) => {
    const conversationId = (root || {}).id || (args || {}).id || (context || {}).conversationId || 1;

    if (context) {
        context.conversationId = conversationId + 1; // we preserve it for iteration
    }

    return {
        id: () => conversationId,
        members: () => [
            Member({ member: conversationId + 20 }),
        ],
    };
};
