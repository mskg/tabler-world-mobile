import faker from 'faker';
import { Member } from './Member';

// tslint:disable: variable-name
// tslint:disable: prefer-template

export const ChatMessage = (root?: any, args?: any, context?: any, _info?: any) => {
    // this is a dirty hack to allow generating the list
    const messageId = (root || {}).messageId || (args || {}).id || (context || {}).messageId || Date.now();

    if (context) {
        context.messageId = messageId + 1; // we preserve it for iteration
    }

    const member = Member({ member: faker.datatype.boolean() ? 1 : 3 });

    return {
        id: messageId,
        eventId: messageId,
        accepted: true,
        delivered: true,
        sender: () => member,
        senderId: () => member.id,
        // receivedAt: () => Date.now(),
        receivedAt: () => faker.date.recent(7),
    };
};
