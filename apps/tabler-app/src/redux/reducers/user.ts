import { ___DONT_USE_ME_DIRECTLY___COLOR_C41, ___DONT_USE_ME_DIRECTLY___COLOR_LCI, ___DONT_USE_ME_DIRECTLY___COLOR_RTI } from '../../theme/colors';
import * as actions from '../actions/user';
import { INITIAL_STATE } from '../initialState';

// tslint:disable-next-line: export-name
export function userReducer(
    state = INITIAL_STATE.auth,
    action:
        | typeof actions.setColor.shape
        | typeof actions.singedIn.shape
        | typeof actions.confirmSignIn.shape
        | typeof actions.signin.shape,
): typeof INITIAL_STATE.auth {
    switch (action.type) {
        case actions.signin.type:
            return { ...state, state: 'signin' };

        case actions.setColor.type:
            let accentColor = ___DONT_USE_ME_DIRECTLY___COLOR_RTI;

            if (action.payload === 'lci') {
                accentColor = ___DONT_USE_ME_DIRECTLY___COLOR_LCI;
            } else if (action.payload === 'c41') {
                accentColor = ___DONT_USE_ME_DIRECTLY___COLOR_C41;
            }

            return {
                ...state,
                accentColor,
            };


        case actions.confirmSignIn.type:
            let userColor = ___DONT_USE_ME_DIRECTLY___COLOR_RTI;

            if (action.payload.username.match(/ladiescircle/ig)) {
                userColor = ___DONT_USE_ME_DIRECTLY___COLOR_LCI;
            } else if (action.payload.username.match(/41er/ig)) {
                userColor = ___DONT_USE_ME_DIRECTLY___COLOR_C41;
            }

            return {
                ...state,
                state: 'confirm',
                username: action.payload.username,
                signinState: action.payload.state,
                accentColor: userColor,
            };

        case actions.singedIn.type:
            return { ...state, state: 'singedIn' };

        default:
            return state;
    }
}
