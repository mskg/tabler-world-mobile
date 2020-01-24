
type Param_Websocket = {
    ttlConnection: number,
    ttlSubscription: number,
};

export const getWebsocketParams = async () => {
    return {
        ttlConnection: 60 * 60 * 4,
        ttlSubscription: 60 * 60 * 4,
    } as Param_Websocket;
};
