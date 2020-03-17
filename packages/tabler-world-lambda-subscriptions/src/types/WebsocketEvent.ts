
export type WebsocketEventBase = {
    /**
     * Trigger action
     */
    eventName: string;

    /**
     * Unique, sortable id
     */
    id: string;

    /**
     * Keep a seperate timestamp for better days
     */
    timestamp: number,

    /**
     * Id of the sender of the message
     */
    sender?: number,

    /**
     * Read by all users?
     */
    delivered?: boolean,

    /**
     * Track delivery of the message
     */
    trackDelivery: boolean,

    /**
     * Wil be removed after delivery
     */
    volatile?: boolean,
};

export type WebsocketEvent<T, PN = null> = {
    /**
     * Optional push notification
     */
    pushNotification?: PN,

    /**
     * Serializable payload
     */
    payload: T;
} & WebsocketEventBase;

export type AnyWebsocketEvent = WebsocketEvent<any, any>;
