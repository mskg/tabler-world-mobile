
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
        }),
    },
);

const INACTIVE_TIMEOUT = 5 * 1000;

function isSignedIn(): boolean {
    try {
        const authState = getReduxStore()?.getState()?.auth?.state;
        return authState === 'singedIn';
    } catch {
        return false;
    }
}

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
                            try {
                                subscriptionClient.close(true, true);
                                closing = undefined;
                                // tslint:disable-next-line: no-empty
                            } catch { }
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

            if (!isSignedIn()) {
                return;
            }

            // @ts-ignore
            // this method is not public but we need to call it to reconnect
            subscriptionClient.tryReconnect();
        }
    } catch (e) {
        logger.error('ws-change', e);
    }
});

subscriptionClient.use([{
    applyMiddleware: (options, next) => {
        try {
            logger.log('[WS] subscribe', options.operationName);
            getReduxStore().dispatch(updateWebsocket(true));
            return next();
        } catch (e) {
            logger.error('ws-middleware', e);
        }
    },
}]);

subscriptionClient.onConnecting(() => {
    try {

        getReduxStore().dispatch(updateWebsocket(false));
        logger.debug('[WS] connecting');
    } catch (e) {
        logger.error('ws-connect', e);
    }
});

subscriptionClient.onConnected(() => {
    try {
        getReduxStore().dispatch(updateWebsocket(true));
        logger.debug('[WS] connected');
    } catch (e) {
        logger.error('ws-connected', e);
    }
});

subscriptionClient.onReconnecting(() => {
    try {
        getReduxStore().dispatch(updateWebsocket(false));
        logger.debug('[WS] econnecting');
    } catch (e) {
        logger.error('ws-reconnecting', e);
    }
});

subscriptionClient.onReconnected(() => {
    try {
        getReduxStore().dispatch(updateWebsocket(true));
        logger.debug('r[WS] econnected');
    } catch (e) {
        logger.error('ws-reconnected', e);
    }
});

subscriptionClient.onDisconnected(() => {
    try {
        getReduxStore().dispatch(updateWebsocket(false));
        logger.debug('[WS] disconnected');
    } catch (e) {
        logger.error('ws-disconnected', e);
    }
});

subscriptionClient.onError((error: any) => {
    if (error instanceof Error) {
        logger.log('[WS] onError', error);
    }
});
