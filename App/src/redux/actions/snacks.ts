import { ISnack } from '../../model/ISnacks';
import { createAction } from './action';

/**
 * Remove sync error notification
 */
export const clearSnacks = createAction<'@@snacks/clear'>(
  '@@snacks/clear',
);

export const shiftSnack = createAction<'@@snacks/shift'>(
  '@@snacks/shift',
);

export const addSnack = createAction<'@@snacks/add', ISnack>(
  '@@snacks/add',
);

export const addErrorSnack = createAction<'@@snacks/addError', any>(
  '@@snacks/addError',
);

