import { Categories, Logger } from '../../helper/Logger';
import * as actions from '../actions/settings';
import { INITIAL_STATE } from '../initialState';

type Result = typeof INITIAL_STATE.settings;
const logger = new Logger(Categories.Redux);

// tslint:disable-next-line: export-name
export function settingsReducer(
    state = INITIAL_STATE.settings,
    action:
        | typeof actions.updateSetting.shape
        | typeof actions.notificationState.shape,
): Result {
    switch (action.type) {
        case actions.notificationState.type:
            return {
                ...state,
                supportsNotifications: action.payload,
            };

        case actions.updateSetting.type:
            logger.debug('[settings]', action.payload.name, '=>', action.payload.value);

            return {
                ...state,
                [action.payload.name]: action.payload.value,
            };

        default:
            return state;
    }
}
