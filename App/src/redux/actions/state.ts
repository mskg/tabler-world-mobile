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
