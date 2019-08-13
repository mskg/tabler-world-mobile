import * as actions from '../actions/state';
import { INITIAL_STATE } from '../initialState';

export function networkReducer(
  state = INITIAL_STATE.connection,
  action:
    | typeof actions.updateNetwork.shape

): typeof INITIAL_STATE.connection {
  switch (action.type) {
    case actions.updateNetwork.type:
      return {
        ...action.payload,
        offline: action.payload.type === "none" || action.payload.type === "NONE"
      }

    default:
      return state;
  }
}
