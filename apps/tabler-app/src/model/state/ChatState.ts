import { IPendingChatMessage } from '../IPendingChatMessage';

export type ChatEdits = {
    [key: string]:
    {
        text?: string,
        image?: string,
    },
};

export type ChatState = {
    badge: number,
    activeConversation: string | null;
    lastEdits: ChatEdits,
    pendingSend: IPendingChatMessage[];
};
