import { createAction } from './action';
import { NetInfoState } from '@react-native-community/netinfo';

/**
 * Enable or disable a district global filter
 */
export const updateAvailable = createAction<'@@state/updateAvailable', string>(
    '@@state/updateAvailable',
);

export const checkAppState = createAction<'@@state/check', string>(
    '@@state/check',
);

export const checkNetwork = createAction<'@@network/check', string>(
    '@@network/check',
);

export const updateNetwork = createAction<'@@network/update', NetInfoState>(
    '@@network/update',
);

export const updateWebsocket = createAction<'@@network/websocket', boolean>(
    '@@network/websocket',
);