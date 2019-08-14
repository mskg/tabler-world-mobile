import * as actions from '../actions/location';
import { INITIAL_STATE } from '../initialState';

export function locationReducer(
  state = INITIAL_STATE.location,
  action:
    | typeof actions.setLocation.shape
): typeof INITIAL_STATE.location {
  switch (action.type) {
    case actions.setLocation.type:
      return {
        ...state,
        address: action.payload.address,
        location: action.payload.location,
        timestamp: Date.now(),
      };

    default:
      return state;
  }
}
