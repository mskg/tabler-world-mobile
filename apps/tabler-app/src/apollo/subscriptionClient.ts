
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { getConfigValue } from '../helper/getConfigValue';
import { updateWebsocket } from '../redux/actions/state';
import { getReduxStore } from '../redux/getRedux';
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

subscriptionClient.use([{
    applyMiddleware: (options, next) => {
        logger.log('[WS] subscribe', options.operationName);
        getReduxStore().dispatch(updateWebsocket(true));
        return next();
    },
}]);

subscriptionClient.onConnecting(() => {
    getReduxStore().dispatch(updateWebsocket(false));
    logger.debug('[WS] connecting');
});

subscriptionClient.onConnected(() => {
    getReduxStore().dispatch(updateWebsocket(true));
    logger.debug('[WS] connected');
});

subscriptionClient.onReconnecting(() => {
    getReduxStore().dispatch(updateWebsocket(false));
    logger.debug('[WS] econnecting');
});

subscriptionClient.onReconnected(() => {
    getReduxStore().dispatch(updateWebsocket(true));
    logger.debug('r[WS] econnected');
});

subscriptionClient.onDisconnected(() => {
    getReduxStore().dispatch(updateWebsocket(false));
    logger.debug('[WS] disconnected');
});

subscriptionClient.onError((error: any) => {
    if (error instanceof Error) {
        logger.log('[WS] onError', error);
    }
});