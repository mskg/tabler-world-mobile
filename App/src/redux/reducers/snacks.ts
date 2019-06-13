import { flatMap } from 'lodash';
import * as actions from '../actions/snacks';
import { INITIAL_STATE } from '../initialState';

type Actions =
  | typeof actions.clearSnacks.shape
  | typeof actions.shiftSnack.shape
  | typeof actions.addSnack.shape
  | typeof actions.addErrorSnack.shape
  ;

type Result = typeof INITIAL_STATE.snacks;

export function snackReducer(
  state = INITIAL_STATE.snacks,
  action: Actions,
): Result {
  switch (action.type) {
    case actions.addErrorSnack.type:
      let error = action.payload;

      if (error.response && error.response.data && error.response.data.message) {
        error = error.response.data.message;
      } else if (error.message) {
        error = error.message;
      }

      return [...state, ...flatMap([error]).map(e => ({
        message: e,
      }))]

    case actions.addSnack.type:
      return [...state, action.payload];

    case actions.shiftSnack.type:
      const newState = [...state];
      newState.shift();

      return newState;

    case actions.clearSnacks.type:
      return [];

    default:
      return state;
  }
}
