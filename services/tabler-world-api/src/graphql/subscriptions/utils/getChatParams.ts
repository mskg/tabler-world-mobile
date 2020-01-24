import { getParameters, Param_Chat } from '@mskg/tabler-world-config';

const chatDefaults = {
    ttl: 60 * 60 * 24 * 2,
    eventsPageSize: 50,
};

export const getChatParams = async () => {
    const p = await getParameters('chat', false);
    if (!p.chat) {
        return {
            ...chatDefaults,
            masterKey: 'SOMETHING THAT MUST BE CONFIGURED',
        } as Param_Chat;
    }

    return {
        ...chatDefaults,
        ...JSON.parse(p.chat),
    } as Param_Chat;
};
