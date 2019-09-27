export type EncodedWebsocketEvent = {
    eventName: string;
    id: string;
    sender?: number,

    pushNotification?: string;
    payload: string;
};
