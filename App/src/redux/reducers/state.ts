import * as actions from '../actions/state';
import { INITIAL_STATE } from '../initialState';

export function stateReducer(
  state = INITIAL_STATE.updateAvailable,
  action:
    | typeof actions.updateAvailable.shape

): typeof INITIAL_STATE.updateAvailable {
  switch (action.type) {
    case actions.updateAvailable.type:
      return true;

    default:
      return state;
  }
}
