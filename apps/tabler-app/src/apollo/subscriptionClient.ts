
import Constants from 'expo-constants';
import { AppState } from 'react-native';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { getConfigValue } from '../helper/getConfigValue';
import { updateWebsocket } from '../redux/actions/state';
import { getReduxStore } from '../redux/getRedux';
import { getClientParameters } from './getClientParameters';
import { getCurrentIdentity } from './getCurrentIdentity';
import { logger } from './logger';

const wsApi = getConfigValue('wsapi');

export const subscriptionClient = new SubscriptionClient(
    wsApi,
    {
        lazy: true,
        reconnect: true,
        reconnectionAttempts: Infinity,

        connectionParams: async () => ({
            ...getClientParameters(),
            Authorization: await getCurrentIdentity(),
            Device: Constants.deviceId || 'dev',
        }),
    },
);

const INACTIVE_TIMEOUT = 5 * 1000;

// tslint:disable-next-line: one-variable-per-declaration
let closing: number | undefined;
AppState.addEventListener('change', (nextAppState: string) => {
    try {
        logger.log('[WS] close', subscriptionClient.status);

        if (nextAppState !== 'active') {
            if (subscriptionClient.status === WebSocket.OPEN) {
                try {
                    logger.log('[WS] starting closing with timeout');

                    if (closing) {
                        clearTimeout(closing);
                    }

                    closing = setTimeout(
                        () => {
                            subscriptionClient.close(true, true);
                            closing = undefined;
                        },
                        INACTIVE_TIMEOUT,
                    );
                } catch (e) {
                    logger.log('Failed to close', e);
                }
            }
        } else {
            if (closing) {
                clearTimeout(closing);
                closing = undefined;
            }

            // @ts-ignore
            // this method is not public but we need to call it to reconnect
            subscriptionClient.tryReconnect();
        }
    } catch (e) {
        logger.error(e, 'Failed to change wbsocket state on active/inactive');
    }
});

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
