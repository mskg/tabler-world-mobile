import * as actions from '../actions/location';
import { INITIAL_STATE } from '../initialState';

// tslint:disable-next-line: export-name
export function locationReducer(
    state = INITIAL_STATE.location,
    action:
        | typeof actions.setThrottle.shape
        | typeof actions.removePending.shape
        | typeof actions.setLocation.shape
        | typeof actions.setNearby.shape,
): typeof INITIAL_STATE.location {
    switch (action.type) {
        case actions.setNearby.type:
            return {
                ...state,
                nearbyMembers: action.payload ? [...action.payload] : [],
            };

        case actions.setThrottle.type:
            return {
                ...state,
                throttleUntil: action.payload,
            };

        case actions.removePending.type:
            return {
                ...state,
                pending: undefined,
            };

        case actions.setLocation.type:
            return {
                ...state,
                address: action.payload.address,
                location: action.payload.location,
                pending: true,
                timestamp: Date.now(),
            };

        default:
            return state;
    }
}
