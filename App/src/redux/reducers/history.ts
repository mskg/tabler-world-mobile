import _ from 'lodash';
import * as actions from '../actions/history';
import { INITIAL_STATE } from '../initialState';

const HISTORY_LENGTH = 20;

export function searchHistoryReducer(
  state = INITIAL_STATE.searchHistory,
  action:
    | typeof actions.addTablerSearch.shape
    | typeof actions.addTablerLRU.shape
) {
  switch (action.type) {
    case actions.addTablerSearch.type:
      // workaround for advanced search
      if (action.payload == "" || action.payload == null) return state;

      const newState = { ...state, members: [action.payload, ...state.members] };
      newState.members = _.uniq(newState.members);

      while (newState.members.length > HISTORY_LENGTH) {
        newState.members.shift();
      }

      return newState;

    case actions.addTablerLRU.type:
      const lruState = _.take(_.uniq([action.payload, ...state.lru]), 10);

      return {
        ...state,
        lru: lruState,
      };

    default:
      return state;
  }
}
