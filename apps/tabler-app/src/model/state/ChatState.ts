import { IPendingChatMessage } from '../IPendingChatMessage';

export type ChatState = {
    badge: number,
    activeConversation: string | null;
    pendingSend: IPendingChatMessage[];
};
