import { getParameters, Param_Chat } from '@mskg/tabler-world-config';

const chatDefaults: Param_Chat = {
    masterKey: 'SOMETHING THAT MUST BE CONFIGURED',

    messageTTL: 60 * 60 * 24 * 14,
    attachmentsTTL: 60 * 60 * 24 * 2,
    eventsPageSize: 20,
    conversationsPageSize: 30,
    maxTextLength: 10 * 1024,
};

export const getChatParams = async () => {
    const p = await getParameters('chat', false);
    if (!p.chat) {
        return chatDefaults;
    }

    return {
        ...chatDefaults,
        ...JSON.parse(p.chat),
    } as Param_Chat;
};
