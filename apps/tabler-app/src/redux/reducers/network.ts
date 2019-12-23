import * as actions from '../actions/state';
import { INITIAL_STATE } from '../initialState';

// tslint:disable-next-line: export-name
export function networkReducer(
    state = INITIAL_STATE.connection,
    action:
        | typeof actions.updateWebsocket.shape
        | typeof actions.updateNetwork.shape,

): typeof INITIAL_STATE.connection {
    switch (action.type) {
        case actions.updateNetwork.type:
            if (false && __DEV__) return INITIAL_STATE.connection;

            return {
                ...state,
                ...action.payload,
                offline: action.payload.type === 'none' || action.payload.type === 'unknown',
            };


        case actions.updateWebsocket.type:
            return {
                ...state,
                websocket: action.payload,
            };

        default:
            return state;
    }
}
