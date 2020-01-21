import { take, uniq } from 'lodash';
import * as actions from '../actions/history';
import { INITIAL_STATE } from '../initialState';

const HISTORY_LENGTH = 20;

// tslint:disable-next-line: max-func-body-length export-name
export function searchHistoryReducer(
    state = INITIAL_STATE.searchHistory,
    action:
        | typeof actions.addTablerSearch.shape
        | typeof actions.addTablerLRU.shape
        | typeof actions.addStructureSearch.shape,
) {
    switch (action.type) {
        case actions.addTablerSearch.type:
            // workaround for advanced search
            if (action.payload === '' || action.payload == null) return state;

            const newState = { ...state, members: [action.payload, ...state.members] };
            newState.members = uniq(newState.members);

            while (newState.members.length > HISTORY_LENGTH) {
                newState.members.shift();
            }

            return newState;

        case actions.addStructureSearch.type:
            // workaround for advanced search
            if (action.payload === '' || action.payload == null) return state;

            const ns = { ...state, structure: [action.payload, ...state.structure] };
            ns.structure = uniq(ns.structure);

            while (ns.structure.length > HISTORY_LENGTH) {
                ns.structure.shift();
            }

            return ns;

        case actions.addTablerLRU.type:
            const lruState = take(uniq([action.payload, ...state.lru]), 10);

            return {
                ...state,
                lru: lruState,
            };

        default:
            return state;
    }
}
