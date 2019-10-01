
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { getConfigValue } from '../helper/getConfigValue';
import { getCurrentIdentity } from './getCurrentIdentity';
import { logger } from './logger';

const wsApi = getConfigValue('ws-api');

export const subscriptionClient = new SubscriptionClient(
    wsApi,
    {
        lazy: true,
        reconnect: true,
        reconnectionAttempts: Infinity,

        connectionParams: async () => ({
            Authorization: await getCurrentIdentity(),
        }),
    },
);

subscriptionClient.onConnecting(() => {
    logger.debug('connecting');
});

subscriptionClient.onConnected(() => {
    logger.debug('connected');
});

subscriptionClient.onReconnecting(() => {
    logger.debug('reconnecting');
});

subscriptionClient.onReconnected(() => {
    logger.debug('reconnected');
});

subscriptionClient.onDisconnected(() => {
    logger.debug('disconnected');
});

subscriptionClient.onError((errors: any[]) => {
    (errors || []).forEach((e) => logger.error(e.data));
});
