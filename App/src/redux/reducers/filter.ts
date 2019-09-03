import _ from 'lodash';
import * as actions from '../actions/filter';
import { INITIAL_STATE } from '../initialState';

type Result = typeof INITIAL_STATE.filter;

// tslint:disable-next-line: max-func-body-length export-name
export function filterReducer(
    state = INITIAL_STATE.filter,
    action:
        // | typeof actions.addDistrict.shape
        // | typeof actions.removeDistrict.shape
        | typeof actions.toggleAll.shape
        | typeof actions.toggleDistrict.shape
        | typeof actions.toggleFavorites.shape
        | typeof actions.toggleFavorite.shape
        | typeof actions.removeFavorite.shape
        | typeof actions.addFavorite.shape
        | typeof actions.toggleOwnTable.shape
        | typeof actions.replaceFavorites.shape
        | typeof actions.toggleAreaBoard.shape
        | typeof actions.toggleAssociationBoard.shape,
): Result {
    switch (action.type) {
        // case actions.addDistrict.type: {
        //   return {
        //     ...state,
        //     tabler: {
        //       ...state.tabler,
        //       area: { ...state.tabler.area || {}, [action.payload]: true }
        //     }
        //   };
        // }

        // case actions.removeDistrict.type: {
        //   const area = { ...(state.tabler.area || {}) };
        //   delete area[action.payload];

        //   return {
        //     ...state,
        //     tabler: {
        //       ...state.tabler,
        //       area,
        //     }
        //   };
        // }

        case actions.toggleDistrict.type: {
            const area = { ...(state.member.area || {}) };

            if (area[action.payload] === true) {
                delete area[action.payload];
            } else {
                area[action.payload] = true;
            }

            return {
                ...state,
                member: {
                    ...state.member,
                    area,
                },
            };
        }

        case actions.toggleAll.type: {
            return {
                ...state,
                member: {
                    ...state.member,
                    area: state.member.area == null ? [] : null,
                    showFavorites: state.member.area == null ? false : true,
                    showOwntable: state.member.area == null ? false : true,
                    showAreaBoard: state.member.area == null ? false : true,
                    showAssociationBoard: state.member.area == null ? false : true,
                },
            };
        }

        case actions.toggleFavorites.type: {
            return {
                ...state,
                member: {
                    ...state.member,
                    showFavorites: !state.member.showFavorites,
                },
            };
        }

        case actions.removeFavorite.type: {
            const favorites = { ...(state.member.favorites || {}) };
            delete favorites[action.payload.id];

            return {
                ...state,
                member: {
                    ...state.member,
                    favorites,
                },
            };
        }

        case actions.addFavorite.type: {
            const favorites = { ...(state.member.favorites || {}) };
            favorites[action.payload.id] = true;

            return {
                ...state,
                member: {
                    ...state.member,
                    favorites,
                },
            };
        }

        case actions.toggleFavorite.type: {
            const favorites = { ...(state.member.favorites || {}) };

            if (favorites[action.payload.id] === true) {
                delete favorites[action.payload.id];
            } else {
                favorites[action.payload.id] = true;
            }

            return {
                ...state,
                member: {
                    ...state.member,
                    favorites,
                },
            };
        }

        case actions.replaceFavorites.type: {
            const newFavorites = _.reduce(
                action.payload,
                (r, v) => { r[v] = true; return r; },
                { length: 0 });

            newFavorites.length = Object.keys(newFavorites).length;

            return {
                ...state,
                member: {
                    ...state.member,
                    favorites: newFavorites,
                },
            };
        }

        case actions.toggleOwnTable.type: {
            return {
                ...state,
                member: {
                    ...state.member,
                    showOwntable: !state.member.showOwntable,
                },
            };
        }

        case actions.toggleAreaBoard.type: {
            return {
                ...state,
                member: {
                    ...state.member,
                    showAreaBoard: !state.member.showAreaBoard,
                },
            };
        }

        case actions.toggleAssociationBoard.type: {
            return {
                ...state,
                member: {
                    ...state.member,
                    showAssociationBoard: !state.member.showAssociationBoard,
                },
            };
        }

        default:
            return state;
    }
}
