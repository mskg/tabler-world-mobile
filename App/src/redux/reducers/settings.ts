import { Categories, Logger } from '../../helper/Logger';
import * as actions from '../actions/settings';
import { INITIAL_STATE } from '../initialState';

type Result = typeof INITIAL_STATE.settings;
const logger = new Logger(Categories.Redux);

export function settingsReducer(
  state = INITIAL_STATE.settings,
  action: typeof actions.updateSetting.shape
): Result {
  switch (action.type) {
    case actions.updateSetting.type:
      logger.debug("[settings]", action.payload.name, "=>", action.payload.value);

      return {
        ...state,
        [action.payload.name]: action.payload.value
      };

    default:
      return state;
  }
}
