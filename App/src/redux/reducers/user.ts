import * as actions from '../actions/user';
import { INITIAL_STATE } from '../initialState';

export function userReducer(
  state = INITIAL_STATE.auth,
  action:
    | typeof actions.singedIn.shape
    | typeof actions.confirmSignIn.shape
    | typeof actions.signin.shape

): typeof INITIAL_STATE.auth {
  switch (action.type) {
    case actions.signin.type:
      return { ...state, state: "signin" };

    case actions.confirmSignIn.type:
      return {
        ...state,
        state: "confirm",
        username: action.payload.username,
        signinState: action.payload.state
      };

    case actions.singedIn.type:
      return { ...state, state: "singedIn" };

    default:
      return state;
  }
}
