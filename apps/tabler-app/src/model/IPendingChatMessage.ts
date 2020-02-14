export interface IPendingChatMessage {
    id: string;
    // we don't have to keep ourself this way
    sender: number;
    conversationId: string;
    createdAt: Date;

    text?: string;
    image?: string;

    failed?: boolean;
    numTries?: number;
}
