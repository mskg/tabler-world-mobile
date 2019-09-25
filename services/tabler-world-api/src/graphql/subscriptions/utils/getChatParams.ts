import { getParameters, Param_Chat } from '@mskg/tabler-world-config';

export const getChatParams = async () => {
    const p = await getParameters('chat', false);
    if (!p.chat) {
        return {
            ttl: 60 * 60 * 24 * 2,
            eventsPageSize: 50,
        } as Param_Chat;
    }
    return JSON.parse(p.chat) as Param_Chat;
};
