import { Member } from './Member';

// tslint:disable: variable-name
// tslint:disable: prefer-template

export const Conversation = (root: any, args?: any, context?: any, _info?: any) => {
    const conversationId = (root || {}).id || (args || {}).id || (context || {}).conversationId || 1;

    if (context) {
        context.conversationId = conversationId + 1; // we preserve it for iteration
    }

    const member = Member({ member: conversationId + 20 });

    return {
        id: () => conversationId,

        subject: () => member.firstname + ' ' + member.lastname,
        pic: () => member.pic,
        participants: () => [
            {
                iscallingidentity: true,
                firstname: 'not used',
                lastname: 'not used',
            },
            {
                member,
                iscallingidentity: false,
                firstname: member.firstname,
                lastname: member.lastname,
            },
        ],

        members: () => [
            Member({ member: conversationId + 20 }),
        ],
    };
};
