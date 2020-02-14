import faker from 'faker';
export const ChatMessage = (root?: any, args?: any, context?: any, _info?: any) => {
    // this is a dirty hack to allow generating the list
    const messageId = (root || {}).messageId || (args || {}).id || (context || {}).messageId || Date.now();

    if (context) {
        context.messageId = messageId + 1; // we preserve it for iteration
    }

    return {
        id: messageId,
        eventId: messageId,
        accepted: true,
        delivered: true,
        senderId: () => faker.random.boolean() ? 1 : 5,
    };
};
