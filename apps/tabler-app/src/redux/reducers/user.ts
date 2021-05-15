import { getFamilyColor } from '../../theme/getFamilyColor';
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
            return {
                ...state,
                accentColor: getFamilyColor(action.payload),
            };


        case actions.confirmSignIn.type:
            let userColor = getFamilyColor('rti');

            if (action.payload.username.match(/ladiescircle/ig)) {
                userColor = getFamilyColor('lci');
            } else if (action.payload.username.match(/41er/ig)) {
                userColor = getFamilyColor('c41');
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
