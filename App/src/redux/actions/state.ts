import { ConnectionInfo } from 'react-native';
import { createAction } from './action';

/**
 * Enable or disable a district global filter
 */
export const updateAvailable = createAction<'@@state/updateAvailable', string>(
  '@@state/updateAvailable'
);

export const checkAppState = createAction<'@@state/check', string>(
  '@@state/check'
);

export const checkNetwork = createAction<'@@network/check', string>(
  '@@network/check'
);

export const updateNetwork = createAction<'@@network/update', ConnectionInfo>(
  '@@network/update'
);
