
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { getConfigValue } from '../helper/getConfigValue';
import { getCurrentIdentity } from './getCurrentIdentity';
import { logger } from './logger';

const wsApi = getConfigValue('ws-api');

export const subscriptionClient = new SubscriptionClient(
    wsApi,
    {
        lazy: !__DEV__,
        reconnect: true,
        reconnectionAttempts: Infinity,

        connectionParams: async () => ({
            Authorization: await getCurrentIdentity(),
        }),
    },
);

subscriptionClient.use([{
    applyMiddleware: (options, next) => {
        logger.log('[WS] subscribe', options.operationName);
        return next();
    },
}]);

subscriptionClient.onConnecting(() => {
    logger.debug('[WS] connecting');
});

subscriptionClient.onConnected(() => {
    logger.debug('[WS] connected');
});

subscriptionClient.onReconnecting(() => {
    logger.debug('[WS] econnecting');
});

subscriptionClient.onReconnected(() => {
    logger.debug('r[WS] econnected');
});

subscriptionClient.onDisconnected(() => {
    logger.debug('[WS] disconnected');
});

subscriptionClient.onError((error: any) => {
    logger.log('[WS] onError', error);
});

// if (__DEV__) {
//     subscriptionClient.close(false, true);
// }
