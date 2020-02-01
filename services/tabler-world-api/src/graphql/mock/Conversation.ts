import { Member } from './Member';

export const Conversation = (root: any, args?: any, context?: any, _info?: any) => {
    const memberId = (root || {}).member || (args || {}).id || (context || {}).memberId || 1;

    if (context) {
        context.memberId = memberId + 1; // we preserve it for iteration
    }

    return {
        id: () => memberId,
        members: () => [
            Member({ member: memberId + 20 }),
        ],
    };
};
