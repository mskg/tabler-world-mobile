import { IPendingChatMessage } from '../IPendingChatMessage';

export type ChatState = {
    activeConversation: string | null;
    pendingSend: IPendingChatMessage[];
};
